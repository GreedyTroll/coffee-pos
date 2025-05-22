from flask import Blueprint, request, jsonify
from common.models import db, Item, Tag, ItemTag
from sqlalchemy.exc import SQLAlchemyError
import logging
from common.models import model_to_dict
from common.wrap import token_required

logger = logging.getLogger()

tags_bp = Blueprint('tags', __name__)

@tags_bp.route('', methods=['GET'])
def tags():
    tags = Tag.query.all()
    return jsonify([model_to_dict(tag) for tag in tags])

@tags_bp.route('/addTag', methods=['POST'])
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

@tags_bp.route('/linkTag', methods=['POST'])
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

@tags_bp.route('/<int:id>', methods=['DELETE'])
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
