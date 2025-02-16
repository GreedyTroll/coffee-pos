from flask import Blueprint, request, jsonify
from common.models import db, Order, PaymentMethod  # Import Seat model
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone, timedelta
import logging
from common.models import model_to_dict
from common.wrap import token_required
from sqlalchemy import func  # Import func for aggregation

logger = logging.getLogger()

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('',methods=['GET'])
@token_required
def stats():
    date_start = request.args.get('date_start')
    date_end = request.args.get('date_end')
    
    query_ordertype = db.session.query(
        Order.ordertype,
        func.sum(Order.totalamount).label('total_revenue')
    ).group_by(Order.ordertype)
    
    query_paymentmethod = db.session.query(
        Order.paymentmethod,
        func.sum(Order.totalamount).label('total_revenue')
    ).group_by(Order.paymentmethod)
    
    if date_start:
        query_ordertype = query_ordertype.filter(Order.orderdate >= datetime.strptime(date_start, '%Y-%m-%d %H:%M:%S'))
        query_paymentmethod = query_paymentmethod.filter(Order.orderdate >= datetime.strptime(date_start, '%Y-%m-%d %H:%M:%S'))
    else:
        today = datetime.now(tz=timezone(timedelta(hours=8))).replace(hour=0, minute=0, second=0, microsecond=0)
        query_ordertype = query_ordertype.filter(Order.orderdate >= today)
        query_paymentmethod = query_paymentmethod.filter(Order.orderdate >= today)
    if date_end:
        query_ordertype = query_ordertype.filter(Order.orderdate <= datetime.strptime(date_end, '%Y-%m-%d %H:%M:%S'))
        query_paymentmethod = query_paymentmethod.filter(Order.orderdate <= datetime.strptime(date_end, '%Y-%m-%d %H:%M:%S'))

    stats_ordertype = query_ordertype.all()
    stats_paymentmethod = query_paymentmethod.all()
    
    stats_dict = {
        'ordertype': [],
        'paymentmethod': []
    }
    
    for ordertype, total_revenue in stats_ordertype:
        stats_dict['ordertype'].append({
            'ordertype': ordertype,
            'total_revenue': total_revenue
        })
    
    for paymentmethod, total_revenue in stats_paymentmethod:
        stats_dict['paymentmethod'].append({
            'paymentmethod': paymentmethod,
            'total_revenue': total_revenue
        })
    
    return jsonify(stats_dict)