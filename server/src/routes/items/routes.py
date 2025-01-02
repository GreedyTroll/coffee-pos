from flask import request, jsonify
from common.models import db, Item, Category, Discount, DiscountCombination
from common.app import app
from sqlalchemy.exc import SQLAlchemyError
import logging
from common.models import model_to_dict

logger = logging.getLogger()
logger.setLevel(logging.INFO)

@app.route('/menu', methods=['GET'])
def menu():
    query = (
        db.query(Category, Item)
        .join(Item, Category.categoryid == Item.categoryid) 
        .order_by(Category.menu_order, Item.menu_order) .all()
    )
    menu = []
    prev_cat_name = ""
    for category, item in query:
        if category.category_name == prev_cat_name:
            menu.append(model_to_dict(category))
        prev_cat_name = category.category_name
        menu.append(model_to_dict(item))

    return jsonify(menu)

@app.route('/menu/addItem', methods=['POST'])
def addItem():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        category = Category.query.filter_by(category_name=data['category'])
        if not category:
            category = Category(category_name=data['category'])
            db.session.add(category)
            db.session.flush() # sends the current state of the session to the database, but it does not commit the transaction
        
        data['categoryid'] = category.categoryid
        new_item = Item(data)
    
        db.session.add(new_item)
        db.session.commit() # makes all the changes in the current transaction permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True}, 200

@app.route('/menu/item/<int:id>', methods=['DELETE'])
def deleteItem(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    item = Item.query.get(id)
    if not item:
        return {'error': "item id not found"}, 400
    
    try:
        # db.session.delete(item)
        item.is_deleted = True
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

@app.route('/menu/addCategory', methods=['POST'])
def addCategory():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        category = Category(data)
        db.session.add(category)
        db.session.commit() # makes all the changes in the current transaction permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True}, 200

@app.route('/menu/category/<int:id>', methods=['DELETE'])
def deleteCategory(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    category = Category.query.get(id)
    if not category:
        return {'error': "item id not found"}, 400
    
    try:
        db.session.delete(category)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

@app.route('/menu/addDiscount', methods=['POST'])
def addDiscount():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        discount = Discount(
            discount_name = data['discount_name'],
            amount = int(data['amount'])
        )
        db.session.add(discount)
        db.session.flush()
        
        for di in data["combination"]:
            category = Category.query.filter(Category.category_name == di['category_name']).first()
            if not category:
                return {"message": "category not found"}, 400
            discount_combination = DiscountCombination(
                discountid = discount.discountid,
                categoryid = category.categoryid,
                quantity = int(di['quantity'])
            )
            db.session.add(discount_combination)

        db.session.commit() # makes all the changes in the current transaction permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True}, 200

@app.route('/menu/discount/<int:id>', methods=['DELETE'])
def deleteDiscount(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    discount = Discount.query.get(id)
    if not discount:
        return {'error': "item id not found"}, 400
    
    try:
        db.session.delete(discount)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200


if __name__ == "__main__":
    app.run()