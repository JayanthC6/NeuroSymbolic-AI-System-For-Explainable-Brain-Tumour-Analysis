from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
from pathlib import Path
import os
import google.generativeai as genai
import base64
import re

ENV_PATH = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

router = APIRouter()

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("⚠️ WARNING: GOOGLE_API_KEY is not set in chatbot_routes.")
else:
    genai.configure(api_key=api_key)
    print("✅ Google Gemini API configured successfully")

class ChatRequest(BaseModel):
    question: str
    image: Optional[str] = None  

class ChatResponse(BaseModel):
    answer: str

SYSTEM_PROMPT = """
You are NeuroEdu Bot, an intelligent AI assistant with expertise in medical education and general knowledge.

**Primary Expertise:**
- Brain tumors, MRI physics, neuroanatomy, and AI/ML concepts (Grad-CAM, U-Net, CNNs, etc.)
- Medical imaging analysis and interpretation
- Educational explanations of complex medical topics

**General Capabilities:**
- Answer questions on ANY topic (science, technology, history, programming, math, etc.)
- Provide clear, accurate, and helpful responses
- Explain complex concepts in an accessible way

**Image Analysis:**
- If an image is provided, analyze it thoroughly and describe what you see
- For medical images (MRI, CT, X-ray): provide educational analysis of anatomy and potential findings
- For general images: describe content, context, objects, text, or any relevant details
- Always be descriptive and insightful

**Important Guidelines:**
- For medical topics: Always include "This is for educational purposes only, not medical advice."
- Keep answers concise, well-structured, and engaging
- Be friendly, encouraging, and helpful
- If you're unsure, acknowledge limitations honestly
"""

def extract_base64_image(data_url: str) -> tuple[str, bytes]:
    """Extract mime type and image data from base64 data URL"""
    if data_url.startswith('data:'):
        match = re.match(r'data:([^;]+);base64,(.+)', data_url)
        if match:
            mime_type = match.group(1)
            image_data = base64.b64decode(match.group(2))
            return mime_type, image_data
    return None, None

@router.post("/edu/chat", response_model=ChatResponse)
async def edu_chat(payload: ChatRequest):
    """
    Educational chat endpoint with Vision support using Google Gemini.
    """
    try:
        if not api_key:
            raise HTTPException(status_code=500, detail="Google API key not configured")
        model = genai.GenerativeModel('gemini-2.5-flash')
        full_prompt = f"{SYSTEM_PROMPT}\n\nUser Question: {payload.question}"
        if payload.image:
            mime_type, image_data = extract_base64_image(payload.image)
            
            if image_data:
                image_part = {
                    'mime_type': mime_type or 'image/png',
                    'data': image_data
                }
                response = model.generate_content([full_prompt, image_part])
            else:
                response = model.generate_content([full_prompt, payload.image])
        else:
            response = model.generate_content(full_prompt)
        
        answer = response.text
        return ChatResponse(answer=answer)

    except Exception as e:
        print("Edu chat error:", repr(e))
        error_msg = str(e)
        if "API_KEY" in error_msg.upper():
            raise HTTPException(status_code=500, detail="Google API key is invalid or not configured properly")
        raise HTTPException(status_code=500, detail=f"AI tutor failed: {error_msg}")