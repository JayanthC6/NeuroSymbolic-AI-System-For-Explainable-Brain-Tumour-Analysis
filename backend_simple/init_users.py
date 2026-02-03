import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

DATABASE_URL = "mongodb://localhost:27017"
DATABASE_NAME = "neurosymbolic_db"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_users():
    client = AsyncIOMotorClient(DATABASE_URL)
    db = client[DATABASE_NAME]
    users_collection = db.users

    users_data = [
        {
            "username": "doctor",
            "full_name": "Dr. John Neural",
            "password": "doc123", 
            "role": "doctor",    
            "email": "doc@neuro.ai"
        },
        {
            "username": "student",
            "full_name": "Student Alex",
            "password": "stu123", 
            "role": "student",    
            "email": "student@college.edu"
        }
    ]

    print("--- Initializing Users ---")
    
    for data in users_data:
        existing = await users_collection.find_one({"username": data["username"]})
        if existing:
            print(f"User {data['username']} already exists. Skipping.")
        else:
            hashed_pw = pwd_context.hash(data["password"])
            user_doc = {
                "username": data["username"],
                "full_name": data["full_name"],
                "email": data["email"],
                "hashed_password": hashed_pw,
                "role": data["role"]
            }
            await users_collection.insert_one(user_doc)
            print(f"✅ Created user: {data['username']} (Role: {data['role']})")

    print("--- Done ---")
    client.close()

if __name__ == "__main__":
    asyncio.run(create_users())