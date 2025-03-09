from flask import Blueprint, request, jsonify
from common.models import db, Employee
from sqlalchemy.exc import SQLAlchemyError
import logging
from common.models import model_to_dict

logger = logging.getLogger()

employees_bp = Blueprint('employees', __name__)

@employees_bp.route('', methods = ['GET'])
def getEmployees():
    employees = Employee.query.all()
    employees_dict = [model_to_dict(model) for model in employees]
    return jsonify(employees_dict)

@employees_bp.route('/add', methods = ['POST'])
def addEmployee():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        new_employee = Employee(
            name=data["name"],
            position=data["position"],
            phone=data["phone"]
        )
        db.session.add(new_employee)
        db.session.commit() # makes all the changes in the current transaction permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True}, 200

@employees_bp.route('/<int:id>', methods = ['DELETE'])
def deleteEmployee(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    employee = Employee.query.get(id)
    if not employee:
        return {'error': "employee id not found"}, 400
    
    try:
        db.session.delete(employee)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200
