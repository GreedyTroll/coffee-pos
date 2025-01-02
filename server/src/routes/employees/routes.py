from flask import request, jsonify
from common.models import db, Employee
from common.app import app
from sqlalchemy.exc import SQLAlchemyError
import logging
from common.models import model_to_dict

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@app.route('/employees', methods=['GET'])
def getEmployees():
    employees = Employee.query.all()
    employees_dict = [model_to_dict(model) for model in employees]
    return jsonify(employees_dict)

@app.route('/employees/add', methods=['POST'])
def addEmployee():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        new_employee = Employee(data)
        db.session.add(new_employee)
        db.session.commit() # makes all the changes in the current transaction permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True}, 200

@app.route('/employees/<int:id>', methods=['DELETE'])
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
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

if __name__ == "__main__":
    app.run()