# seedMongo.py
import os
import json
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI not found in .env")

client = MongoClient(MONGO_URI, tls=True, tlsCAFile=certifi.where())
db = client.get_database("animora")
collection = db.get_collection("diseases")

json_file = "diseases_100plus.json"

with open(json_file, "r", encoding="utf-8") as f:
    data = json.load(f)

if not isinstance(data, dict) or "diseases" not in data:
    raise ValueError("JSON file must be an object with a top-level 'diseases' array")

diseases = data["diseases"]
if not isinstance(diseases, list) or len(diseases) == 0:
    raise ValueError("No disease entries found")

inserted = 0
for d in diseases:
    # Upsert by name (avoid duplicates)
    if "name" not in d:
        continue
    collection.update_one(
        {"name": d["name"]},
        {"$set": d},
        upsert=True
    )
    inserted += 1

print(f"✅ Upserted {inserted} disease records into MongoDB (animora.diseases)")
