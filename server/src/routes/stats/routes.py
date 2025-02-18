from flask import Blueprint, request, jsonify
from common.models import db, Order, Item, OrderItem 
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone, timedelta
import logging
from common.models import model_to_dict
from common.wrap import token_required
from sqlalchemy import func  # Import func for aggregation

logger = logging.getLogger()

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('',methods=['GET'])
#@token_required
def stats():
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    bucket_size = request.args.get('bucket_size')
    
    query_ordertype = db.session.query(
        Order.ordertype,
        func.sum(Order.totalamount).label('total_revenue')
    ).group_by(Order.ordertype)
    
    query_paymentmethod = db.session.query(
        Order.paymentmethod,
        func.sum(Order.totalamount).label('total_revenue')
    ).group_by(Order.paymentmethod)
    
    if date_start:
        date_start = datetime.fromisoformat(date_start.replace('Z', '+00:00'))
        query_ordertype = query_ordertype.filter(Order.orderdate >= date_start)
        query_paymentmethod = query_paymentmethod.filter(Order.orderdate >= date_start)
    else:
        today = datetime.now(tz=timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        query_ordertype = query_ordertype.filter(Order.orderdate >= today)
        query_paymentmethod = query_paymentmethod.filter(Order.orderdate >= today)
    if date_end:
        date_end = datetime.fromisoformat(date_end.replace('Z', '+00:00'))
        query_ordertype = query_ordertype.filter(Order.orderdate <= date_end)
        query_paymentmethod = query_paymentmethod.filter(Order.orderdate <= date_end)

    if bucket_size:
        if bucket_size == '1d':
            bucket_interval = func.date_trunc('day', Order.orderdate)
        elif bucket_size == '1h':
            bucket_interval = func.date_trunc('hour', Order.orderdate)
        elif bucket_size == '15m':
            bucket_interval = func.date_trunc('minute', Order.orderdate, 15)
        else:
            return jsonify({'error': 'Invalid bucket size'}), 400
        
        query_ordertype = query_ordertype.add_columns(bucket_interval.label('bucket')).group_by(bucket_interval)
        query_paymentmethod = query_paymentmethod.add_columns(bucket_interval.label('bucket')).group_by(bucket_interval)

    stats_ordertype = query_ordertype.all()
    stats_paymentmethod = query_paymentmethod.all()
    
    stats_dict = {
        'ordertype': [],
        'paymentmethod': []
    }
    
    # Fetch distinct order types and payment methods
    distinct_ordertype = db.session.query(Order.ordertype).distinct().all()
    distinct_paymentmethod = db.session.query(Order.paymentmethod).distinct().all()
    
    for ordertype, total_revenue, *bucket in stats_ordertype:
        entry = {
            'ordertype': ordertype,
            'total_revenue': total_revenue
        }
        if bucket:
            entry['bucket'] = bucket[0].astimezone(timezone(timedelta(hours=8))).isoformat()
        stats_dict['ordertype'].append(entry)
    
    for paymentmethod, total_revenue, *bucket in stats_paymentmethod:
        entry = {
            'paymentmethod': paymentmethod,
            'total_revenue': total_revenue
        }
        if bucket:
            entry['bucket'] = bucket[0].astimezone(timezone(timedelta(hours=8))).isoformat()
        stats_dict['paymentmethod'].append(entry)
    
    # Include incomplete buckets

    print(stats_dict)
    return jsonify(stats_dict)

@stats_bp.route('/by-product', methods=['GET'])
#@token_required
def statsByProduct():
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    quantity = request.args.get('quantity', 'false').lower() == 'true'
    
    if quantity:
        query_product = db.session.query(
            Item.productid,
            Item.productname,
            func.sum(OrderItem.quantity).label('total_quantity')
        ).join(OrderItem, Item.productid == OrderItem.productid).join(Order, Order.orderid == OrderItem.orderid).group_by(Item.productid, Item.productname)
    else:
        query_product = db.session.query(
            Item.productid,
            Item.productname,
            func.sum(OrderItem.quantity * Item.price).label('total_revenue')
        ).join(OrderItem, Item.productid == OrderItem.productid).join(Order, Order.orderid == OrderItem.orderid).group_by(Item.productid, Item.productname)
    
    if date_start:
        date_start = datetime.fromisoformat(date_start.replace('Z', '+00:00'))
        query_product = query_product.filter(Order.orderdate >= date_start)
    else:
        today = datetime.now(tz=timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        query_product = query_product.filter(Order.orderdate >= today)
    if date_end:
        date_end = datetime.fromisoformat(date_end.replace('Z', '+00:00'))
        query_product = query_product.filter(Order.orderdate <= date_end)

    if quantity:
        query_product = query_product.order_by(func.sum(OrderItem.quantity).desc()).limit(10)
        total_quantity = db.session.query(func.sum(OrderItem.quantity)).join(Order, Order.orderid == OrderItem.orderid).scalar()
    else:
        query_product = query_product.order_by(func.sum(OrderItem.quantity * Item.price).desc()).limit(10)
        total_revenue = db.session.query(func.sum(Order.totalamount)).scalar()

    stats_product = query_product.all()
    
    stats_dict = {
        'product': []
    }
    
    for productid, productname, total in stats_product:
        entry = {
            'productid': productid,
            'productname': productname
        }
        if quantity:
            entry['total_quantity'] = total
            entry['percentage'] = (total / total_quantity) * 100 if total_quantity else 0
        else:
            entry['total_revenue'] = total
            entry['percentage'] = (total / total_revenue) * 100 if total_revenue else 0
        stats_dict['product'].append(entry)
    
    return jsonify(stats_dict)