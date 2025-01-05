from flask import Blueprint, request, jsonify
from common.models import db, Seat
from sqlalchemy.exc import SQLAlchemyError
import logging
from common.models import model_to_dict

logger = logging.getLogger()
logger.setLevel(logging.INFO)

seats_bp = Blueprint('seats', __name__)

@seats_bp.route('', methods=['GET'])
def getSeats():
    seats = Seat.query.all()
    seats_dict = [model_to_dict(model) for model in seats]
    return jsonify(seats_dict)

@seats_bp.route('/add', methods=['POST'])
def addSeat():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        new_seat = Seat(
            seatid=data['seatid'], 
            floor=int(data['floor']), 
            posx=int(data['posx']), 
            posy = int(data['posy'])
        )    
        db.session.add(new_seat)
        db.session.commit() # makes all the changes in the current transaction permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True, 'seat_id': new_seat.seatid}, 200

@seats_bp.route('/<string:id>', methods=['DELETE'])
def deleteSeat(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    seat = Seat.query.get(id)
    if not seat:
        return {'error': "seat id not found"}, 400
    
    try:
        db.session.delete(seat)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200
