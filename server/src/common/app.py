from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

app = Flask(__name__)
app.config.from_object('config.Config')

db.init_app(app)

# Import and register blueprints
from routes.employees.routes import employees_bp
from routes.menu.routes import menu_bp
from routes.seats.routes import seats_bp
from routes.parties.routes import parties_bp

app.register_blueprint(employees_bp, url_prefix='/employees')
app.register_blueprint(menu_bp, url_prefix='/menu')
app.register_blueprint(seats_bp, url_prefix='/seats')
app.register_blueprint(parties_bp, url_prefix='/parties')