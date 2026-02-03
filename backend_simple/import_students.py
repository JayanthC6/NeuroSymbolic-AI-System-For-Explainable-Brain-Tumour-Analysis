import asyncio
import csv
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

DATABASE_URL = "mongodb://localhost:27017"
DATABASE_NAME = "neurosymbolic_db"
CSV_FILE = "students_list.csv"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def import_students():
    print(f"🚀 Starting Bulk Import from {CSV_FILE}...")

    client = AsyncIOMotorClient(DATABASE_URL)
    db = client[DATABASE_NAME]
    users_collection = db.users
    
    if not os.path.exists(CSV_FILE):
        print(f"❌ Error: {CSV_FILE} not found.")
        return

    raw_data = open(CSV_FILE, 'rb').read()
    
    if raw_data.startswith(b'PK\x03\x04'):
        print("❌ Error: The file appears to be an Excel (.xlsx) file saved as .csv.")
        print("👉 Please open Excel, go to 'Save As', and select 'CSV (Comma delimited) (*.csv)'.")
        return

    try:
        content = raw_data.decode('utf-8-sig')
        print("✅ Detected UTF-8 encoding.")
    except UnicodeDecodeError:
        try:
            content = raw_data.decode('latin-1')
            print("✅ Detected Latin-1 (Windows) encoding.")
        except:
            print("❌ Error: Could not decode file. Please save it as standard CSV (UTF-8).")
            return

    from io import StringIO
    file_stream = StringIO(content)
    
    try:
        dialect = csv.Sniffer().sniff(content[:1024])
        file_stream.seek(0)
        csv_reader = csv.reader(file_stream, dialect)
    except csv.Error:
        file_stream.seek(0)
        csv_reader = csv.reader(file_stream)

    headers = next(csv_reader, None)
    if not headers:
        print("❌ Error: CSV file is empty.")
        return

    cleaned_headers = [h.strip().replace('\ufeff', '') for h in headers]
    print(f"🔍 Detected Columns: {cleaned_headers}")

    try:
        user_idx = cleaned_headers.index("username")
        pass_idx = cleaned_headers.index("password")
        name_idx = cleaned_headers.index("full_name")
        email_idx = cleaned_headers.index("email")
    except ValueError as e:
        print(f"❌ Column Missing Error: {e}")
        print("Required columns: username, password, full_name, email")
        return

    count = 0
    skipped = 0

    for row in csv_reader:
        if len(row) < 4: continue

        username = row[user_idx].strip()
        password = row[pass_idx].strip()
        full_name = row[name_idx].strip()
        email = row[email_idx].strip()
        
        if await users_collection.find_one({"username": username}):
            print(f"⚠️  Skipping {username} (Already exists)")
            skipped += 1
            continue

        hashed_password = pwd_context.hash(password)
        
        student_doc = {
            "username": username,
            "full_name": full_name,
            "email": email,
            "hashed_password": hashed_password,
            "role": "student"
        }
        
        await users_collection.insert_one(student_doc)
        print(f"✅ Added: {full_name}")
        count += 1

    print("-" * 30)
    print(f"🎉 Import Complete! Added: {count}, Skipped: {skipped}")
    client.close()

if __name__ == "__main__":
    asyncio.run(import_students())