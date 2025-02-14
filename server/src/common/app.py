from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import logging
import sys
from pythonjsonlogger import jsonlogger
import re

# Custom log formatter to include IP, HTTP method, route, and status code
class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def process_log_record(self, log_record):
        message = log_record.get('message', '')
        match = re.search(r'(?P<ip>\d+\.\d+\.\d+\.\d+) - - \[(?P<datetime>[^\]]+)\] "(?P<method>\w+) (?P<route>[^ ]+) HTTP/[^"]+" (?P<status_code>\d+)', message)
        if match:
            log_record['ip'] = match.group('ip')
            log_record['method'] = match.group('method')
            log_record['route'] = match.group('route')
            log_record['status_code'] = match.group('status_code')
        return super().process_log_record(log_record)

# Configure logging
logHandler = logging.StreamHandler(sys.stdout)
formatter = CustomJsonFormatter('%(asctime)s %(name)s %(levelname)s %(message)s')
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

db = SQLAlchemy()

app = Flask(__name__)
CORS(app)

app.config.from_object('config.Config')

db.init_app(app)

# Import and register blueprints
from routes.employees.routes import employees_bp
from routes.menu.routes import menu_bp
from routes.seats.routes import seats_bp
from routes.parties.routes import parties_bp
from routes.orders.routes import orders_bp

app.register_blueprint(employees_bp, url_prefix='/employees')
app.register_blueprint(menu_bp, url_prefix='/menu')
app.register_blueprint(seats_bp, url_prefix='/seats')
app.register_blueprint(parties_bp, url_prefix='/parties')
app.register_blueprint(orders_bp, url_prefix='/orders')