from flask import Blueprint, request, jsonify
from common.models import db, Item, Addon, LinkAddon, AddonGroup, LinkAddonGroup
from sqlalchemy.exc import SQLAlchemyError
import logging
from common.models import model_to_dict
from common.wrap import token_required

logger = logging.getLogger()

addons_bp = Blueprint('addons', __name__)

@addons_bp.route('', methods=['GET'])
def addons():
    addons = db.session.query(Addon).outerjoin(AddonGroup, Addon.addongroup == AddonGroup.groupid).all()
    result = []
    for addon in addons:
        addon_dict = model_to_dict(addon)
        addon_group = AddonGroup.query.get(addon.addongroup) if addon.addongroup else None
        addon_dict['groupname'] = addon_group.groupname if addon_group else None
        addon_dict['groupid'] = addon_group.groupid if addon_group else None
        result.append(addon_dict)
    return jsonify(result)

@addons_bp.route('/addonGroups', methods=['GET'])
def addonGroups():
    addon_groups = AddonGroup.query.all()
    return jsonify([model_to_dict(addon_group) for addon_group in addon_groups])

@addons_bp.route('/addAddonGroup', methods=['POST'])
@token_required
def addAddonGroup():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    try:
        addon_group = AddonGroup(
            groupname=data['group_name']
        )
        db.session.add(addon_group)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    return {'groupid': addon_group.groupid, 'success': True}, 200

@addons_bp.route('/addonGroup/<int:id>', methods=['DELETE'])
@token_required
def deleteAddonGroup(id):
    if not id:
        return {'error': 'no id provided'}, 400
    try:
        addon_group = AddonGroup.query.get(id)
        if not addon_group:
            return {'error': "addon group id not found"}, 400
        db.session.delete(addon_group)
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    return {'success': True}, 200

@addons_bp.route('/addAddon', methods=['POST'])
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
        if 'addon_group' in data:
            addon_group = AddonGroup.query.get(int(data.get('addon_group')))
            if not addon_group:
                return {'error': 'addon group not found'}, 400
        else:
            addon_group = None
        addon = Addon(
            addongroup=addon_group.groupid if addon_group else None,
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

@addons_bp.route('/linkAddon', methods=['POST'])
@token_required
def linkAddon():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    if data is None:
        return {"message": 'no data received'}, 400
    
    try:
        product_id = data['product_id']
        if not product_id:
            return {'error': 'no product id provided'}, 400
        product = Item.query.get(product_id)
        if not product:
            return {'error': 'product not found'}, 400
        if group_ids := data.get('group_ids'):
            print(group_ids)
            for group_id in group_ids:
                addon_group = AddonGroup.query.get(group_id)
                if not addon_group:
                    return {'error': f'addon group with id {group_id} not found'}, 400 

                existing_groups = {linked_group.groupid for linked_group in LinkAddonGroup.query.filter_by(itemid=product_id).all()}
                new_groups = set(group_ids)
                groups_to_remove = existing_groups - new_groups
                groups_to_add = new_groups - existing_groups
                for group_id in groups_to_remove:
                    LinkAddonGroup.query.filter_by(itemid=product_id, groupid=group_id).delete()
                for group_id in groups_to_add:
                    db.session.add(LinkAddonGroup(itemid=product_id, groupid=group_id))

        elif addon_ids := data.get('addon_ids'):
            print(addon_ids)
            addons = Addon.query.filter(Addon.addonid.in_(addon_ids)).all()
            for addon in addons:
                if addon.addongroup is not None:
                    return {'error': 'addon can only be linked by addon groups'}, 400
            existing_addons = {available_addon.addonid for available_addon in LinkAddon.query.filter_by(itemid=product_id).all()}
            new_addons = set(addon_ids)
            addons_to_remove = existing_addons - new_addons
            addons_to_add = new_addons - existing_addons

            for addon_id in addons_to_remove:
                LinkAddon.query.filter_by(itemid=product_id, addonid=addon_id).delete()
            for addon_id in addons_to_add:
                db.session.add(LinkAddon(itemid=product_id, addonid=addon_id))
        else:
            return {'error': 'no addon ids provided'}, 400
        
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True}, 200

@addons_bp.route('/updateAddonGroup', methods=['PUT'])
@token_required
def updateAddonGroup():
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form.to_dict()
    
    # Check if data is received
    if data is None:
        return {"message": 'no data received'}, 400

    addon_id = data.get('addon_id')
    if not addon_id:
        return {'error': 'no addon id provided'}, 400
    addon = Addon.query.get(addon_id)
    if not addon:
        return {'error': "addon id not found"}, 400

    group_id = data.get('group_id')
    if not group_id:
        group_id = None

    if group_id == None:
        addon_group = None 
    else:
        addon_group = AddonGroup.query.get(group_id)
        if not addon_group:
            return {'error': "addon group id not found"}, 400
    
    try:
        addon.addongroup = group_id
        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        logger.error(f'{e}')
        return {'Error': f'{e}'}, 500
    
    return {'success': True}, 200

@addons_bp.route('/<int:id>', methods=['DELETE'])
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