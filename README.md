# 🧠 Neurosymbolic AI for Explainable Brain Tumor Diagnosis
### Final Year MCA Project | Advanced Medical Imaging & Education Platform

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Tech Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20FastAPI%20%2B%20TensorFlow-blue)
![Batch](https://img.shields.io/badge/Batch-2025-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![Made with](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red)

## 📖 Abstract
This project implements a **Neurosymbolic Artificial Intelligence** system to diagnose brain tumors (Glioma, Meningioma, Pituitary) from MRI scans. Unlike traditional "Black Box" AI models, this system combines **Deep Learning (Neuro)** for visual perception with **Symbolic Logic (Symbolic)** for reasoning.

The platform serves two distinct user groups:
1.  **Clinicians:** Provides automated diagnosis, segmentation, longitudinal tracking, and explainable reports.
2.  **Students:** Offers an interactive "Learning Lab" with 3D anatomy visualization, gamified diagnosis challenges, and an AI tutor.

---

## 🚀 Key Features

### 🏥 For Doctors (Clinical Support)
* **Multi-Modal AI Analysis:**
    * **CNN (VGG16):** Classifies tumor type with high accuracy.
    * **U-Net:** Generates pixel-perfect segmentation masks.
    * **Grad-CAM:** Visualizes AI attention heatmaps (XAI).
* **Neurosymbolic Reasoning:** Converts raw pixel data into human-readable logic (e.g., *"Tumor is large (>10cm³) and located in the frontal lobe, suggesting aggressive growth"*).
* **Human-in-the-Loop:** Doctors can manually edit/correct AI masks using a brush tool, ensuring 100% accuracy.
* **Longitudinal Tracking:** Compare "Before vs. After" scans with a visual difference heatmap (Growth vs. Shrinkage calculation).
* **Clinical Decision Support:** AI-generated Severity Score (0-100) and Treatment Protocol suggestions based on NCCN guidelines.
* **Reporting:** Automated PDF generation and Text-to-Speech audio summaries.
* **DICOM Support:** Handles professional medical imaging formats (`.dcm`) alongside standard images.

### 🎓 For Students (Education)
* **Interactive Learning Lab:** A dedicated module to learn brain anatomy and tumor pathology.
* **3D Neural Visualization:** Real-time simulation of the AI's neural network architecture.
* **Diagnosis Challenge:** A gamified module where students draw the tumor boundary and get an **IoU Accuracy Score** against the AI.
* **NeuroEdu Bot:** An integrated LLM-powered chatbot (OpenAI GPT-4o) for answering medical queries and analyzing uploaded diagrams.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework:** React.js (v18)
* **Styling:** Tailwind CSS (Glassmorphism UI)
* **Visualization:** Chart.js (Progress charts), HTML5 Canvas (Mask editing/Drawing)
* **Reporting:** jsPDF, html2canvas, Web Speech API

### **Backend**
* **Framework:** FastAPI (Python)
* **AI/ML:** TensorFlow, OpenCV, NumPy, Pillow
* **Medical Data:** Pydicom (DICOM processing)
* **Database:** MongoDB (Motor Asyncio)
* **LLM Integration:** OpenAI API (GPT-4o-mini)

---

## ⚙️ Installation & Setup

### 1. Prerequisites
* Python 3.9+
* Node.js & npm
* MongoDB (Running locally on default port 27017)

### 2. Backend Setup
Navigate to the backend folder and install dependencies.

```bash
cd backend_simple
# Create virtual environment (Optional but recommended)
python -m venv venv
# Activate venv (Windows)
.\venv\Scripts\activate 

# Install requirements
pip install -r requirements.txt