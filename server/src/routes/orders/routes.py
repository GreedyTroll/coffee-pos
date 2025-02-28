from flask import Blueprint, request, jsonify
from common.models import db, Order, OrderItem, Item, OrderDetail, PaymentMethod, Party, Seat, Addon  # Import Seat model
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone, timedelta
import logging
from common.models import model_to_dict
from common.wrap import token_required

logger = logging.getLogger()

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('',methods=['GET'])
@token_required
def orders():
    paid = request.args.get('paid')
    amount_min = request.args.get('amount_min')
    amount_max = request.args.get('amount_max')
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    fulfilled = request.args.get('fulfilled')
    if fulfilled is None:
        fulfilled = 'false'
    party = request.args.get('party_id')
    active = request.args.get('active')

    query = OrderDetail.query.outerjoin(Party, OrderDetail.partyid == Party.partyid)
    query = query.outerjoin(Seat, Party.partyid == Seat.partyid)  # Join with Seat table

    if not paid:
        query = query.filter(OrderDetail.paidtime.is_(None))
    elif paid == 'paid':
        query = query.filter(OrderDetail.paidtime.isnot(None))
    if amount_min:
        query = query.filter(OrderDetail.totalamount >= float(amount_min))
    if amount_max:
        query = query.filter(OrderDetail.totalamount <= float(amount_max))
    if date_start:
        query = query.filter(OrderDetail.orderdate >= datetime.strptime(date_start, '%Y-%m-%d'))
    else:
        today = datetime.now(tz=timezone(timedelta(hours=8))).replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.filter(OrderDetail.orderdate >= today)
    if date_end:
        query = query.filter(OrderDetail.orderdate <= datetime.strptime(date_end, '%Y-%m-%d'))
    if fulfilled.lower() == 'false':
        query = query.filter(OrderDetail.preparing == True)
    elif fulfilled.lower() == 'true':
        query = query.filter(OrderDetail.preparing == False)
    if party:
        query = query.filter(OrderDetail.partyid == int(party))
    elif active is not None and active.lower() == 'false':
        query = query.filter(Party.leftat.isnot(None))
    else:
        query = query.filter(Party.leftat.is_(None))

    orders = query.all()
    orders_dict = []
    for order in orders:
        order_dict = model_to_dict(order)
        if order.party:
            order_dict['seat_ids'] = [seat.seatid for seat in order.party.seats]  # Add seat IDs to the response
        else:
            order_dict['seat_ids'] = []  # No seats if no party
        orders_dict.append(order_dict)
    
    return jsonify(orders_dict)

@orders_bp.route('/new', methods=['POST'])
@token_required
def newOrder():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    if not data.get('items'):
        return {"message": 'no items in order'}, 400

    try:
        new_order = Order(
            partyid= data['party_id'] if data.get('party_id') else None,
            paymentmethod=data['payment_method'],
            paidtime=datetime.now(tz=timezone(timedelta(hours=8))) if data.get('paid') else None,
            ordertype=data['order_type'],
            notes=data['notes'] if data.get('notes') else None
        )
        db.session.add(new_order)

        total = 0
        for item in data['items']:
            product = Item.query.get(item['product_id'])
            if not product: # make sure product in request exist
                return {"message": f"Product with id {item['product_id']} not found"}, 400

            addon_total = 0
            addons = []
            if item.get('addons'): # make sure addons in request exist
                for addon_id in item['addons']:
                    addon = Addon.query.get(addon_id)
                    if addon:
                        addons.append({'name': addon.addonname, 'price': addon.price})
                        addon_total += addon.price
                    else:
                        return {"message": f"Addon with id {addon_id} not found"}, 400

            order_item = OrderItem(
                orderid = new_order.orderid,
                productid=item['product_id'],
                quantity=item['quantity'],
                productname=product.productname,
                # addons = item['addons'] if item.get('addons') else None,
                addons = addons, 
                unitprice=int(product.price) + addon_total
            )
            db.session.add(order_item)
            total += int(item['quantity']) * int(order_item.unitprice)
        
        new_order.totalamount = total
        
        db.session.commit() # makes all the changes in the current Orders permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True, 'order_id': new_order.orderid}, 200

@orders_bp.route('/<int:id>', methods=['PUT'])
@token_required
def updateOrder(id):
    if not id:
        return {'error': 'no order id provided'}, 400
    
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()

    if not data:
        return {'error': 'no data provided'}, 400

    order = Order.query.get(id)
    if not order:
        return {'error': "Order id not found"}, 404

    try:
        if data.get('party_id'):
            order.partyid = data['party_id']
        if data.get('payment_method'):
            order.paymentmethod = data['payment_method']
        if data.get('paid'):
            order.paidtime = datetime.now()
        if data.get('order_type'):
            order.ordertype = data['order_type']
        if data.get('items'):
            OrderItem.query.filter_by(orderid=order.orderid).delete()
            db.session.flush()
            total = 0
            for item in data['items']:
                product = Item.query.get(item['product_id'])
                if not product:
                    return {"message": f"Product with id {item['product_id']} not found"}, 400

                order_item = OrderItem(
                    orderid = order.orderid,
                    productid=item['product_id'],
                    quantity=item['quantity']
                )
                db.session.add(order_item)
                total += int(item['quantity']) * int(product.price)
            order.totalamount = total  
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

@orders_bp.route('/delivered/<int:orderitem_id>', methods=['PUT'])
@token_required
def markDelivered(orderitem_id):
    if not orderitem_id:
        return {'error': 'no order item id provided'}, 400

    orderitem = OrderItem.query.get(orderitem_id)
    if not orderitem:
        return {'error': "Order id not found"}, 404

    try:
        orderitem.delivered = not orderitem.delivered
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

@orders_bp.route('/paymentmethods', methods=['GET'])
def getPaymentMethods():
    payment_methods = PaymentMethod.query.all()
    payment_methods_dict = [payment_method.methodname for payment_method in payment_methods]
    return jsonify(payment_methods_dict)