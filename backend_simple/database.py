"""
Handles all database connection and data models (Pydantic).
This file does NOT contain any API endpoints.
"""

import uvicorn
import os
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from pydantic_core import core_schema
from bson import ObjectId
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime

DATABASE_URL = "mongodb://localhost:27017"
DATABASE_NAME = "neurosymbolic_db"

client = AsyncIOMotorClient(DATABASE_URL)
db = client[DATABASE_NAME]
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type: Any, handler: Any) -> core_schema.CoreSchema:
        
        def validate(v, info): 
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid ObjectId")
            return ObjectId(v)
        
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.with_info_plain_validator_function(validate),
            serialization=core_schema.plain_serializer_function_ser_schema(lambda x: str(x))
        )

class User(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: str = "radiologist"

class UserInDB(User):
    hashed_password: str

class Study(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    patient_id: str
    study_date: datetime = Field(default_factory=datetime.now)
    mri_image_path: str
    seg_mask_path: Optional[str] = None
    grad_cam_path: Optional[str] = None
    
    ai_facts: Dict[str, Any]
    final_explanation: str
    doctor_notes: Optional[str] = ""
    treatment: Optional[Dict[str, Any]] = None 

    model_config = ConfigDict(
        json_encoders={ObjectId: str},
        validate_by_name=True,
    )

class Patient(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    patient_id: str
    full_name: str
    date_of_birth: str
    medical_history_summary: Optional[str] = ""

    model_config = ConfigDict(
        json_encoders={ObjectId: str},
        validate_by_name=True,
    )

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class PatientDetailsResponse(BaseModel):
    """
    This is the specific response model for the get_patient_details endpoint.
    It tells Pydantic to serialize the 'patient' field as a Patient
    and the 'studies' field as a List of Study.
    """
    patient: Patient
    studies: List[Study]