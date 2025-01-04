from flask import Blueprint, request, jsonify
from common.models import db, Party, Seat, SeatAssignment
from sqlalchemy.exc import SQLAlchemyError
import pytz
from datetime import datetime
# from datetime import timezone, timedelta
import logging
from common.models import model_to_dict

logger = logging.getLogger()
logger.setLevel(logging.INFO)

parties_bp = Blueprint('parties', __name__)

@parties_bp.route('',methods=['GET'])
def parties():
    parties = Party.query.all()
    parties_dict = [model_to_dict(model) for model in parties]
    return jsonify(parties_dict)

@parties_bp.route('/add', methods=['POST'])
def addParty():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        new_party = Party(
            partysize=data['party_size'],
            notes=data['notes']
        )
    
        db.session.add(new_party)
        db.session.commit() # makes all the changes in the current transaction permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True, 'party_id': new_party.partyid}, 200

@parties_bp.route('/<int:id>', methods=['PUT'])
def deactivateParty(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    party = Party.query.get(id)
    if not party:
        return {'error': "party id not found"}, 400
    
    try:
        # unassign all seats

        local_timezone = pytz.timezone('Asia/Taipei')
        party.leftat = datetime.now(local_timezone)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

@parties_bp.route('/assignSeats', method=['POST'])
def assignSeats():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # validate request data
    if data is None:
        return {"message": 'no data received'}, 400
    
    if not data['party_id']:
        return {"message": 'party id not provided'}, 400

    party = Party.query.get(data['party_id'])
    if party is None:
        return {"message": 'party not found'}, 400
    
    if not data['seats']:
        return {"message": 'seats not provided'}, 400
    try:
        for seat_id in data['seats']:
            seat = Seat.query.get(seat_id)
            if seat is None:
                return {"message": 'invalid seat id {}'.format(seat_id)}, 400
            seat_assignment = SeatAssignment(
                partyid = party.partyid,
                seatid = seat.seatid
            )
            db.session.add(seat_assignment)
            db.session.flush()
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500