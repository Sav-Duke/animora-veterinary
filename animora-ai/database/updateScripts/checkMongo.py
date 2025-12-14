import json
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi

load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri, tls=True, tlsCAFile=certifi.where())

