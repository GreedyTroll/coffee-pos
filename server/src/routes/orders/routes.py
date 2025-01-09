from flask import Blueprint, request, jsonify
from common.models import db, Order, OrderItem, Item
from sqlalchemy.exc import SQLAlchemyError

from datetime import datetime, timezone, timedelta
# from datetime import timezone, timedelta
import logging
from common.models import model_to_dict

logger = logging.getLogger()
logger.setLevel(logging.INFO)

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('',methods=['GET'])
def orders():
    paid = request.args.get('paid')
    amount_min = request.args.get('amount_min')
    amount_max = request.args.get('amount_max')
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')

    query = Order.query

    if not paid:
        query = query.filter(Order.paidtime.is_(None))
    elif paid == 'paid':
        query = query.filter(Order.paidtime.isnot(None))
    if amount_min:
        query = query.filter(Order.totalamount >= float(amount_min))
    if amount_max:
        query = query.filter(Order.totalamount <= float(amount_max))
    if date_start:
        query = query.filter(Order.orderdate >= datetime.strptime(date_start, '%Y-%m-%d'))
    else:
        today = datetime.now(tz=timezone(timedelta(hours=8))).date()
        query = query.filter(Order.orderdate >= today)
    if date_end:
        query = query.filter(Order.orderdate <= datetime.strptime(date_end, '%Y-%m-%d'))

    orders = query.outerjoin(OrderItem, Order.orderid == OrderItem.orderid).all()
    orders_dict = []
    for order in orders:
        order_dict = model_to_dict(order)
        order_items = OrderItem.query.filter_by(orderid=order.orderid).all()
        order_dict['items'] = [model_to_dict(item) for item in order_items]
        orders_dict.append(order_dict)
    print(orders_dict)
    return jsonify(orders_dict)

@orders_bp.route('/new/<int:party_id>', methods=['POST'])
def newOrder(party_id):
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
            partyid=party_id,
            paymentmethod=data['payment_method'],
            paidtime=datetime.now() if data.get('paid') else None,
            ordertype=data['order_type']
        )
        db.session.add(new_order)

        total = 0
        for item in data['items']:
            product = Item.query.get(item['product_id'])
            if not product:
                return {"message": f"Product with id {item['product_id']} not found"}, 400

            order_item = OrderItem(
                orderid = new_order.orderid,
                productid=item['product_id'],
                quantity=item['quantity']
            )
            db.session.add(order_item)
            total += item['quantity'] * product.price
        
        new_order.totalamount = total
        
        db.session.commit() # makes all the changes in the current Orders permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True, 'order_id': new_order.orderid}, 200

@orders_bp.route('/<int:id>', methods=['PUT'])
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
                total += item['quantity'] * product.price
            order.totalamount = total  
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

@orders_bp.route('/delivered/<int:orderitem_id>', methods=['PUT'])
def markDelivered(orderitem_id):
    if not orderitem_id:
        return {'error': 'no order item id provided'}, 400

    orderitem = OrderItem.query.get(orderitem_id)
    if not orderitem:
        return {'error': "Order id not found"}, 404

    try:
        orderitem.delivered = True
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200