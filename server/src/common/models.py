from enum import Enum
from sqlalchemy.sql import func
# from datetime import datetime
from app import db

def model_to_dict(model):
    result = {}
    for column in model.__table__.columns:
        value = getattr(model, column.name)
        if isinstance(value, Enum):
            value = value.name  # Convert Enum to its name
        result[column.name] = value
    return result

class Seat(db.Model):
    __tablename__ = 'seats'
    seatid = db.Column(db.String(5), primary_key=True)
    floor = db.Column(db.Integer, nullable=False)
    posx = db.Column(db.Integer, nullable=False)
    posy = db.Column(db.Integer, nullable=False)
    is_taken = db.Column(db.Boolean, default=False)

class Party(db.Model):
    __tablename__ = 'parties'
    partyid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=func.now())

class SeatAssignment(db.Model):
    __tablename__ = 'seatassignments'
    assignmentid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    partyid = db.Column(db.Integer, db.ForeignKey('parties.partyid'), nullable=False)
    seatid = db.Column(db.String(5), db.ForeignKey('seats.seatid'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=func.now())
    left_at = db.Column(db.DateTime, nullable=True)

class Employee(db.Model):
    __tablename__ = 'employees'
    employeeid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50))
    position = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=func.now())

class Category(db.Model):
    __tablename__ = 'categories'
    categoryid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    menu_order = db.Column(db.Integer)
    category_name = db.Column(db.String(100))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=func.now())

class Item(db.Model):
    __tablename__ = 'items'
    productid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_name = db.Column(db.String(100))
    menu_order = db.Column(db.Integer)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2))
    categoryid = db.Column(db.Integer, db.ForeignKey('categories.categoryid'))
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=func.now())

class Discount(db.Model):
    __tablename__ = 'discounts'
    discountid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    discount_name = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Numeric(10, 2))

class DiscountCombination(db.Model):
    __tablename__ = 'discountcombinations'
    combinationid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    discountid = db.Column(db.Integer, db.ForeignKey('discounts.discountid'))
    categoryid = db.Column(db.Integer, db.ForeignKey('categories.categoryid'))
    quantity = db.Column(db.Integer)

class Order(db.Model):
    __tablename__ = 'orders'
    orderid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    partyid = db.Column(db.Integer, db.ForeignKey('parties.partyid'))
    employeeid = db.Column(db.Integer, db.ForeignKey('employees.employeeid'))
    order_date = db.Column(db.DateTime, default=func.now())
    total_amount = db.Column(db.Numeric(10, 2))
    notes = db.Column(db.text)

class OrderItem(db.Model):
    __tablename__ = 'orderitems'
    orderitemid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    orderid = db.Column(db.Integer, db.ForeignKey('orders.orderid'))
    productid = db.Column(db.Integer, db.ForeignKey('items.productid'))
    quantity = db.Column(db.Integer)
    price = db.Column(db.Numeric(10, 2))
