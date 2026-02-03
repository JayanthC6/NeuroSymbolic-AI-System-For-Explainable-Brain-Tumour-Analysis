import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from . import auth
from . import patient_routes
from . import chatbot_routes  
from . import quiz_routes

app = FastAPI(
    title="Neurosymbolic AI API",
    description="API for brain tumor diagnosis, segmentation, and educational support.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Plugging in authentication router...")
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

print("Plugging in patient & study router...")
app.include_router(patient_routes.router, tags=["Patients & Studies"])

print("Plugging in student chat router...")
app.include_router(chatbot_routes.router, prefix="/api", tags=["Student AI Bot"])

print("Plugging in quiz router...")
app.include_router(quiz_routes.router, prefix="/api", tags=["Quiz"])

UPLOADS_DIR = Path(__file__).resolve().parent / "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)  # Ensure it exists

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
print(f"Serving static files from: {UPLOADS_DIR}")

@app.get("/", tags=["Root"])
async def read_root():
  return {"message": "Welcome to the Neurosymbolic AI API"}


if __name__ == "__main__":
    uvicorn.run("backend_simple.main:app", host="127.0.0.1", port=8000, reload=True)
