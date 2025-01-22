from flask import Blueprint, request, jsonify
from common.models import db, Party, Seat
from sqlalchemy.exc import SQLAlchemyError
import json

import pytz
from datetime import datetime
import logging
from common.models import model_to_dict
from common.wrap import token_required

logger = logging.getLogger()
logger.setLevel(logging.INFO)

parties_bp = Blueprint('parties', __name__)

@parties_bp.route('',methods=['GET'])
@token_required
def parties():
    parties = Party.query.filter(Party.leftat.is_(None)).all()
    parties_dict = [model_to_dict(model) for model in parties]
    return jsonify(parties_dict)

@parties_bp.route('/add', methods=['POST'])
@token_required
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
            partysize=data['partysize'],
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
@token_required
def updateParty(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()

    if not data:
        return {'error': 'no data provided'}, 400

    party = Party.query.get(id)
    if not party:
        return {'error': "party id not found"}, 404

    try:
        if 'partysize' in data:
            party.partysize = data['partysize']
        if 'notes' in data:
            party.notes = data['notes']
        
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

@parties_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def deactivateParty(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    party = Party.query.get(id)
    if not party:
        return {'error': "party id not found"}, 400
    
    released_seats = []
    try:
        # unassign all seats
        seats = Seat.query.all()
        for seat in seats:
            if seat.partyid == party.partyid:
                seat.partyid = None
                released_seats.append(seat.seatid)
        db.session.flush()

        local_timezone = pytz.timezone('Asia/Taipei')
        party.leftat = datetime.now(local_timezone)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True, 'released_seats': json.dumps(released_seats)}, 200

@parties_bp.route('/assignSeats/<int:party_id>', methods=['POST','PUT'])
@token_required
def assignSeats(party_id):
    if not party_id:
        return {'error': 'no party id provided'}, 400

    party = Party.query.get(party_id)
    if not party:
        return {'error': "party id not found"}, 404

    data = request.get_json()
    seat_ids = data.get('seat_ids', [])

    try:
        # Unassign all current seats
        Seat.query.filter_by(partyid=party_id).update({'partyid': None})
        db.session.commit()

        # Assign new seats
        for seat_id in seat_ids:
            seat = Seat.query.get(seat_id)
            if seat and seat.partyid is None:
                seat.partyid = party_id
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200