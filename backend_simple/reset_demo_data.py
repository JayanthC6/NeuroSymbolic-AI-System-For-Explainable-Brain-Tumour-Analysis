# backend_simple/reset_demo_data.py

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

DATABASE_URL = "mongodb://localhost:27017"
DATABASE_NAME = "neurosymbolic_db"

async def main():
    client = AsyncIOMotorClient(DATABASE_URL)
    db = client[DATABASE_NAME]

    # Delete all documents from patients and studies
    result_patients = await db.patients.delete_many({})
    result_studies = await db.studies.delete_many({})

    print(f"Deleted {result_patients.deleted_count} patients")
    print(f"Deleted {result_studies.deleted_count} studies")

    await client.close()

if __name__ == "__main__":
    asyncio.run(main())
