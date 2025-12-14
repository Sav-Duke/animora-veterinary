from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi  # this fixes SSL issues

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("❌ MONGO_URI not found in .env file")

client = MongoClient(mongo_uri, tls=True, tlsCAFile=certifi.where())
db = client.get_database("animora")  # your database name
disease_collection = db.get_collection("diseases")




