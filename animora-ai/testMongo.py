from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi  # handles SSL

# Load environment variables from .env
load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("❌ MONGO_URI not found in .env file")

# Connect to MongoDB Atlas with SSL certificate
client = MongoClient(mongo_uri, tls=True, tlsCAFile=certifi.where())

# Get the animora database
db = client.get_database("animora")

# Print collections to confirm connection
print("✅ Connection successful!")
print("Collections in 'animora' database:", db.list_collection_names())
