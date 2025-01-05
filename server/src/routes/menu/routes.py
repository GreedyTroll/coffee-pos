from flask import Blueprint, request, jsonify
from common.models import db, Item, Category, Discount, DiscountCombination
from sqlalchemy.exc import SQLAlchemyError
import logging
from common.models import model_to_dict

logger = logging.getLogger()
logger.setLevel(logging.INFO)

menu_bp = Blueprint('menu', __name__)

@menu_bp.route('',methods=['GET'])
def menu():
    query = (
        db.session.query(Category, Item)
        .join(Item, Category.categoryid == Item.categoryid) 
        .order_by(Category.menuorder, Item.menuorder) .all()
    )
    menu = []
    prev_cat_name = ""
    for category, item in query:
        if category.categoryname != prev_cat_name:
            menu.append(model_to_dict(category))
        prev_cat_name = category.categoryname
        menu.append(model_to_dict(item))

    return jsonify(menu)

@menu_bp.route('/addItem', methods=['POST'])
def addItem():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        category = Category.query.filter_by(categoryname=data['category']).first()
        if not category:
            category = Category(categoryname=data['category'])
            db.session.add(category)
            db.session.flush() # sends the current state of the session to the database, but it does not commit the transaction
        
        data['categoryid'] = category.categoryid
        new_item = Item(
            productname=data['product_name'],
            menuorder=data['menu_order'],
            description=data['description'],
            price=int(data['price']),
            categoryid=category.categoryid
        )
    
        db.session.add(new_item)
        db.session.commit() # makes all the changes in the current transaction permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500
    
    return {'category': category.categoryid, 'item': new_item.productid, 'success': True}, 200

@menu_bp.route('/item/<int:id>', methods=['DELETE'])
def deleteItem(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    item = Item.query.get(id)
    if not item:
        return {'error': "item id not found"}, 400
    
    try:
        item.isdeleted = True
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

@menu_bp.route('/addCategory', methods=['POST'])
def addCategory():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        category = Category(
            menuorder=data['menu_order'],
            categoryname=data['category_name'],
            description=data['description']
        )
        db.session.add(category)
        db.session.commit() # makes all the changes in the current transaction permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.info(f'Error occurred: {e}')
        return {'Error': f'{e}'}, 500
    if category:
        return {'categoryid': category.categoryid, 'success': True}, 200
    return {'success': True}, 200

@menu_bp.route('/category/<int:id>', methods=['DELETE'])
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

@menu_bp.route('/addDiscount', methods=['POST'])
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
            category = Category.query.filter(Category.categoryname == di['category_name']).first()
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

@menu_bp.route('/discount/<int:id>', methods=['DELETE'])
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
