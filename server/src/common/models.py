from enum import Enum
from sqlalchemy.sql import func
from app import db
from sqlalchemy import PrimaryKeyConstraint

def model_to_dict(model):
    result = {}
    for column in model.__table__.columns:
        value = getattr(model, column.name)
        if isinstance(value, Enum):
            value = value.name  # Convert Enum to its name
        result[column.name] = value
    return result

class Party(db.Model):
    __tablename__ = 'parties'
    partyid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    createdat = db.Column(db.DateTime, default=func.now())
    leftat = db.Column(db.DateTime, nullable=True)
    seats = db.relationship('Seat', backref='party')  # Add relationship to Seat

class Seat(db.Model):
    __tablename__ = 'seats'
    seatid = db.Column(db.String(10), primary_key=True)
    floor = db.Column(db.Integer, nullable=False)
    posx = db.Column(db.Integer, nullable=False)
    posy = db.Column(db.Integer, nullable=False)
    partyid = db.Column(db.Integer, db.ForeignKey('parties.partyid'), nullable=True)
    
class Employee(db.Model):
    __tablename__ = 'employees'
    employeeid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(50))
    position = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    createdat = db.Column(db.DateTime, default=func.now())

class Category(db.Model):
    __tablename__ = 'categories'
    categoryid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    menuorder = db.Column(db.Integer)
    categoryname = db.Column(db.String(100), unique=True)
    description = db.Column(db.Text)
    createdat = db.Column(db.DateTime, default=func.now())

class Item(db.Model):
    __tablename__ = 'items'
    productid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    productname = db.Column(db.String(100))
    menuorder = db.Column(db.Integer)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2))
    categoryid = db.Column(db.Integer, db.ForeignKey('categories.categoryid'))
    ishidden = db.Column(db.Boolean, default=False)
    createdat = db.Column(db.DateTime, default=func.now())

class Tag(db.Model):
    __tablename__ = 'tags'
    tagid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tagname = db.Column(db.String(20), nullable=False)
    tagcolor = db.Column(db.String(20), default="#000000", nullable=False)

class ItemTag(db.Model):
    __tablename__ = 'itemtags'
    itemid = db.Column(db.Integer, db.ForeignKey('items.productid'))
    tagid = db.Column(db.Integer, db.ForeignKey('tags.tagid'))
    __table_args__ = (
        PrimaryKeyConstraint('itemid', 'tagid'),
    )

class Addon(db.Model):
    __tablename__ = 'addons'
    addonid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    addonname = db.Column(db.String(100))
    price = db.Column(db.Numeric(10, 2))
    category = db.Column(db.String(20))
    createdat = db.Column(db.DateTime, default=func.now())

class AvailableAddon(db.Model):
    __tablename__ = 'availableaddons'
    itemid = db.Column(db.Integer, db.ForeignKey('items.productid'))
    addonid = db.Column(db.Integer, db.ForeignKey('addons.addonid'))
    __table_args__ = (
        PrimaryKeyConstraint('itemid', 'addonid'),
    )

class PaymentMethod(db.Model):
    __tablename__ = 'paymentmethods'
    methodname = db.Column(db.String(20), primary_key=True)

class Order(db.Model):
    __tablename__ = 'orders'
    orderid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    partyid = db.Column(db.Integer, db.ForeignKey('parties.partyid'))
    employeeid = db.Column(db.Integer, db.ForeignKey('employees.employeeid'))
    orderdate = db.Column(db.DateTime, default=func.now())
    totalamount = db.Column(db.Numeric(10, 2))
    paymentmethod = db.Column(db.String(20), db.ForeignKey('paymentmethods.methodname'))
    paidtime = db.Column(db.DateTime)
    ordertype = db.Column(db.String(20))
    notes = db.Column(db.Text)

class OrderItem(db.Model):
    __tablename__ = 'orderitems'
    orderitemid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    orderid = db.Column(db.Integer, db.ForeignKey('orders.orderid'))
    productid = db.Column(db.Integer, db.ForeignKey('items.productid'))
    productname = db.Column(db.String(100))
    addons = db.Column(db.JSON)
    quantity = db.Column(db.Integer)
    unitprice = db.Column(db.Numeric(10, 2))
    delivered = db.Column(db.Boolean, default=False)

class OrderDetail(db.Model):
    __tablename__ = 'orderdetails'
    orderid = db.Column(db.Integer, primary_key=True)
    partyid = db.Column(db.Integer, db.ForeignKey('parties.partyid'))  # Add foreign key to Party
    employeeid = db.Column(db.Integer)
    orderdate = db.Column(db.DateTime)
    totalamount = db.Column(db.Numeric(10, 2))
    paymentmethod = db.Column(db.String(20))
    paidtime = db.Column(db.DateTime)
    ordertype = db.Column(db.String(20))
    items = db.Column(db.JSON)
    preparing = db.Column(db.Boolean)
    party = db.relationship('Party', backref='orderdetails')  # Add relationship to Party