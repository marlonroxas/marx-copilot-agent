#!/usr/bin/env python3
"""Drop the application MongoDB database collections for octofit_db.

Run with the backend venv Python to use the installed pymongo.
"""
import sys
from pymongo import MongoClient

DB_NAME = "octofit_db"
MONGO_URI = "mongodb://localhost:27017"

def main():
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        # force connect
        client.admin.command('ping')
    except Exception as e:
        print("ERROR: Cannot connect to MongoDB at", MONGO_URI)
        print("Detail:", e)
        sys.exit(2)

    try:
        print(f"Dropping database '{DB_NAME}'...")
        client.drop_database(DB_NAME)
        print("Dropped.")
    except Exception as e:
        print("ERROR while dropping database:", e)
        sys.exit(3)

if __name__ == '__main__':
    main()
