import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql+psycopg2://<username>:<password>@<db_url>/CoffeeShopPOS')
    SQLALCHEMY_TRACK_MODIFICATIONS = False