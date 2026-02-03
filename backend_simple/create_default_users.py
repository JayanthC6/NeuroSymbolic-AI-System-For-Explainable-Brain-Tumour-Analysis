import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from database import pwd_context  

DATABASE_URL = "mongodb://localhost:27017"
DATABASE_NAME = "neurosymbolic_db"

async def main():
    client = AsyncIOMotorClient(DATABASE_URL)
    db = client[DATABASE_NAME]

    users = [
        {
            "username": "doctor1",
            "full_name": "Dr. Jayanth",
            "email": "doctor@example.com",
            "role": "doctor",
            "password": "doctor123",
        },
        {
            "username": "student1",
            "full_name": "Student Jayanth",
            "email": "student@example.com",
            "role": "student",
            "password": "student123",
        },
    ]

    for u in users:
        existing = await db.users.find_one({"username": u["username"]})
        if existing:
            print(f"User {u['username']} already exists, skipping.")
            continue

        hashed = pwd_context.hash(u["password"])
        doc = {
            "username": u["username"],
            "full_name": u["full_name"],
            "email": u["email"],
            "role": u["role"],
            "hashed_password": hashed,
        }
        await db.users.insert_one(doc)
        print(f"Created user {u['username']} with role {u['role']}")

    await client.close()

if __name__ == "__main__":
    asyncio.run(main())
