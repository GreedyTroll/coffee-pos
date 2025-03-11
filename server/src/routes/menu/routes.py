from flask import Blueprint, request, jsonify
from common.models import db, Item, Category, Tag, ItemTag, Addon, AvailableAddon
from sqlalchemy.exc import SQLAlchemyError
import logging
from common.models import model_to_dict
from common.wrap import token_required

logger = logging.getLogger()

menu_bp = Blueprint('menu', __name__)

@menu_bp.route('', methods=['GET'])
def menu():
    categories = db.session.query(Category).order_by(Category.menuorder).all()
    items = db.session.query(Item).order_by(Item.menuorder).all()
    
    item_tags = db.session.query(ItemTag).all()
    tags = db.session.query(Tag).all()
    available_addons = db.session.query(AvailableAddon).all()
    addons = db.session.query(Addon).all()

    tag_dict = {tag.tagid: model_to_dict(tag) for tag in tags}
    addon_dict = {addon.addonid: model_to_dict(addon) for addon in addons}

    item_tag_map = {}
    for item_tag in item_tags:
        if item_tag.itemid not in item_tag_map:
            item_tag_map[item_tag.itemid] = []
        item_tag_map[item_tag.itemid].append(tag_dict[item_tag.tagid])

    item_addon_map = {}
    for available_addon in available_addons:
        if available_addon.itemid not in item_addon_map:
            item_addon_map[available_addon.itemid] = []
        item_addon_map[available_addon.itemid].append(addon_dict[available_addon.addonid])

    menu = []
    for category in categories:
        category_dict = model_to_dict(category)
        category_items = [model_to_dict(item) for item in items if item.categoryid == category.categoryid]
        for item_dict in category_items:
            item_id = item_dict['productid']
            item_dict['tags'] = item_tag_map.get(item_id, [])
            item_dict['addons'] = item_addon_map.get(item_id, [])
        category_dict['items'] = category_items
        menu.append(category_dict)

    return jsonify(menu)

##########
# ITEMS  #
##########
@menu_bp.route('/addItem', methods=['POST'])
@token_required
def addItem():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    if not 'categoryid' in data and not 'category' in data:
        return {"message": "category not provided"}, 400

    try:
        if 'categoryid' in data:
            category = Category.query.get(data['categoryid'])
        elif 'category' in data:
            category = Category.query.filter_by(categoryname=data['category']).first()    
        if not category:
            if 'category' in data:
                category = Category(categoryname=data['category'])
            db.session.add(category)
            db.session.flush() # sends the current state of the session to the database, but it does not commit the transaction
        
        data['categoryid'] = category.categoryid
        
        # Replace null values with defaults if keys are not present in data
        new_item = Item(
            productname=data.get('product_name', None),
            menuorder=data.get('menu_order', 0),
            description=data.get('description', ''),
            price=float(data.get('price', 0)),
            remainingstock=int(data.get('remaining_stock', None)),
            categoryid=category.categoryid
        )
    
        db.session.add(new_item)
        db.session.commit() # makes all the changes in the current transaction permanent (cannot be rolled back)
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    
    return {'category': category.categoryid, 'item': new_item.productid, 'success': True}, 200

@menu_bp.route('/item/<int:id>', methods=['PUT'])
@token_required
def updateItem(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    item = Item.query.get(id)
    if not item:
        return {'error': "item id not found"}, 400
    
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        item.productname = data.get('product_name', item.productname)
        item.menuorder = data.get('menu_order', item.menuorder)
        item.description = data.get('description', item.description)
        item.price = float(data.get('price', item.price))
        item.categoryid = data.get('categoryid', item.categoryid)
        item.remainingstock = data.get('remaining_stock', None)
        item.ishidden = data.get('is_hidden', item.ishidden)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    
    return {'item': item.productid, 'success': True}, 200

@menu_bp.route('/item/<int:id>', methods=['DELETE'])
@token_required
def deleteItem(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    item = Item.query.get(id)
    if not item:
        return {'error': "item id not found"}, 400
    
    try:
        db.session.delete(item)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

@menu_bp.route('/item/setHidden/<int:id>', methods=['PUT'])
@token_required
def setItemHidden(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    item = Item.query.get(id)
    if not item:
        return {'error': "item id not found"}, 400
    try:
        item.ishidden = not item.ishidden
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

##############
# CATEGORIES #
##############
@menu_bp.route('/addCategory', methods=['POST'])
@token_required
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
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    if category:
        return {'categoryid': category.categoryid, 'success': True}, 200
    return {'success': True}, 200

@menu_bp.route('/category/<int:id>', methods=['PUT'])
@token_required
def updateCategory(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    category = Category.query.get(id)
    if not category:
        return {'error': "category id not found"}, 400
    try:
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        # Check if data is received
        if data is None:
            return {"message": 'no data received'}, 400
        
        category.menuorder = data.get('menu_order', category.menuorder)
        category.categoryname = data.get('category_name', category.categoryname)
        category.description = data.get('description', category.description)
        
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
        
    return  {'category': category.categoryid, 'success': True}, 200

@menu_bp.route('/category/<int:id>', methods=['DELETE'])
@token_required
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
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

#############
#    TAGS   #
#############
@menu_bp.route('/tags', methods=['GET'])
def tags():
    tags = Tag.query.all()
    return jsonify([model_to_dict(tag) for tag in tags])

@menu_bp.route('/addTag', methods=['POST'])
@token_required
def addTag():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        tag = Tag(
            tagname=data['tag_name'],
            tagcolor=data.get('tag_color', '#000000')
        )
        db.session.add(tag)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    
    return {'tagid': tag.tagid, 'success': True}, 200

@menu_bp.route('/linkTag', methods=['POST'])
@token_required
def linkTag():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        tag_ids = data.get('tag_ids', [])
        if 'category_id' in data:
            items = Item.query.filter_by(categoryid=data['category_id']).all()
            for item in items:
                existing_tags = {item_tag.tagid for item_tag in ItemTag.query.filter_by(itemid=item.productid).all()}
                new_tags = set(tag_ids)
                tags_to_remove = existing_tags - new_tags
                tags_to_add = new_tags - existing_tags

                for tag_id in tags_to_remove:
                    ItemTag.query.filter_by(itemid=item.productid, tagid=tag_id).delete()
                for tag_id in tags_to_add:
                    db.session.add(ItemTag(itemid=item.productid, tagid=tag_id))
        else:
            product_id = data['product_id']
            existing_tags = {item_tag.tagid for item_tag in ItemTag.query.filter_by(itemid=product_id).all()}
            new_tags = set(tag_ids)
            tags_to_remove = existing_tags - new_tags
            tags_to_add = new_tags - existing_tags

            for tag_id in tags_to_remove:
                ItemTag.query.filter_by(itemid=product_id, tagid=tag_id).delete()
            for tag_id in tags_to_add:
                db.session.add(ItemTag(itemid=product_id, tagid=tag_id))
        
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True}, 200

@menu_bp.route('/tags/<int:id>', methods=['DELETE'])
@token_required
def deleteTag(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    tag = Tag.query.get(id)
    if not tag:
        return {'error': "tag id not found"}, 400
    
    try:
        db.session.delete(tag)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200

###########
# ADDONS  #
###########
@menu_bp.route('/addons', methods=['GET'])
def addons():
    addons = Addon.query.all()
    return jsonify([model_to_dict(addon) for addon in addons])

@menu_bp.route('/addAddon', methods=['POST'])
@token_required
def addAddon():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        addon = Addon(
            addonname=data['addon_name'],
            price=float(data['price'])
        )
        db.session.add(addon)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    
    return {'addonid': addon.addonid, 'success': True}, 200

@menu_bp.route('/linkAddon', methods=['POST'])
@token_required
def linkAddon():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        addon_ids = data.get('addon_ids', [])
        if 'category_id' in data:
            items = Item.query.filter_by(categoryid=data['category_id']).all()
            for item in items:
                existing_addons = {available_addon.addonid for available_addon in AvailableAddon.query.filter_by(itemid=item.productid).all()}
                new_addons = set(addon_ids)
                addons_to_remove = existing_addons - new_addons
                addons_to_add = new_addons - existing_addons

                for addon_id in addons_to_remove:
                    AvailableAddon.query.filter_by(itemid=item.productid, addonid=addon_id).delete()
                for addon_id in addons_to_add:
                    db.session.add(AvailableAddon(itemid=item.productid, addonid=addon_id))
        else:
            product_id = data['product_id']
            existing_addons = {available_addon.addonid for available_addon in AvailableAddon.query.filter_by(itemid=product_id).all()}
            new_addons = set(addon_ids)
            addons_to_remove = existing_addons - new_addons
            addons_to_add = new_addons - existing_addons

            for addon_id in addons_to_remove:
                AvailableAddon.query.filter_by(itemid=product_id, addonid=addon_id).delete()
            for addon_id in addons_to_add:
                db.session.add(AvailableAddon(itemid=product_id, addonid=addon_id))
        
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True}, 200

@menu_bp.route('/addons/<int:id>', methods=['DELETE'])
@token_required
def deleteAddon(id):
    if not id:
        return {'error': 'no id provided'}, 400
    
    addon = Addon.query.get(id)
    if not addon:
        return {'error': "addon id not found"}, 400
    
    try:
        db.session.delete(addon)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500

    return {'success': True}, 200
