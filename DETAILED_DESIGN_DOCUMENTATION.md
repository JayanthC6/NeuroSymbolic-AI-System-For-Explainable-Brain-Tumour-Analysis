# 📐 AI Visualizer Project - Detailed Design Documentation

> **Comprehensive Technical Design Specification**

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Design](#2-architecture-design)
3. [Component Specifications](#3-component-specifications)
4. [Data Models](#4-data-models)
5. [API Endpoints](#5-api-endpoints)
6. [AI/ML Pipeline Details](#6-aiml-pipeline-details)
7. [Frontend Components](#7-frontend-components)
8. [Security & Authentication](#8-security--authentication)
9. [Performance Considerations](#9-performance-considerations)
10. [Deployment Architecture](#10-deployment-architecture)

---

## 1. System Overview

### 1.1 Project Description

**Neurosymbolic AI Visualizer** is an advanced medical imaging platform that combines deep learning (neural networks) with symbolic reasoning (logic-based AI) to diagnose brain tumors from MRI scans. The system integrates multi-modal data (visual + genetic) to provide comprehensive clinical insights.

### 1.2 Key Features

| Feature | Description | Technology |
|---------|-------------|------------|
| **Brain Tumor Classification** | 4-class classification (Glioma, Meningioma, Pituitary, No Tumor) | VGG16 CNN |
| **Tumor Segmentation** | Pixel-level tumor boundary detection | U-Net Architecture |
| **Explainable AI (XAI)** | Visual attention heatmaps | Grad-CAM |
| **Symbolic Reasoning** | Medical logic and treatment planning | Rule-based System |
| **Multi-Modal Analysis** | Visual + Genetic data integration | IDH/MGMT biomarkers |
| **Interactive Mask Editing** | Manual correction of segmentation | HTML5 Canvas |
| **Scan Comparison** | Temporal analysis of tumor progression | Pixel-diff algorithm |
| **PDF Report Generation** | Comprehensive medical reports | html2canvas + jsPDF |
| **AI Chatbot** | Educational assistant for students | OpenAI GPT-4o |
| **Federated Learning** | Distributed model training | TensorFlow Federated |

### 1.3 System Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│              Presentation Layer (React)                 │
│  • User Interface  • State Management  • Visualization  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│            Application Layer (FastAPI)                  │
│  • REST API  • Authentication  • Business Logic         │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│              AI Processing Layer                        │
│  • CNN  • U-Net  • Grad-CAM  • Symbolic Reasoner        │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│              Data Layer                                 │
│  • MongoDB (Structured Data)  • File Storage (Images)   │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Design

### 2.1 Frontend Architecture

**Framework**: React 18  
**State Management**: React Hooks (useState, useEffect, useRef)  
**Styling**: Tailwind CSS (utility-first)  
**HTTP Client**: Axios with interceptors  
**Visualization**: Chart.js (Line charts for progression)  
**PDF Generation**: html2canvas + jsPDF  

#### Component Hierarchy

```
App
├── Navbar
├── LoginPage
├── DoctorDashboard
│   ├── CreatePatientModal
│   └── PatientCard (multiple)
├── PatientDetail
│   ├── GenomicPanel
│   ├── MaskEditor
│   ├── ComparisonCanvas
│   └── MedicalReportTemplate (hidden, for PDF)
├── AnalysisPage
│   └── UploadForm
├── FederatedDashboard
├── LearningLabPage
│   ├── BrainAnatomyPage
│   ├── TumorLibraryPage
│   └── AiArchitecturePage
└── NeuroEduBot
    └── ChatInterface
```

### 2.2 Backend Architecture

**Framework**: FastAPI (async Python)  
**Database**: MongoDB (Motor async driver)  
**Authentication**: JWT (JSON Web Tokens)  
**File Handling**: aiofiles (async file I/O)  
**AI Framework**: TensorFlow 2.19  
**Image Processing**: OpenCV, PIL, PyDicom  

#### Module Structure

```
backend_simple/
├── main.py                    # FastAPI app entry point
├── auth.py                    # JWT authentication
├── database.py                # MongoDB models & connection
├── patient_routes.py          # Patient & study endpoints
├── chatbot_routes.py          # OpenAI chatbot integration
├── quiz_routes.py             # Quiz management
├── app_simple/
│   ├── ai_pipeline_simple.py  # Main AI orchestration
│   ├── reasoner_simple.py     # Symbolic reasoning engine
│   └── xai_simple.py          # Grad-CAM implementation
├── models/
│   ├── model.h5               # VGG16 classifier
│   └── segmentation_model.h5  # U-Net segmenter
└── uploads/                   # File storage
    └── xai_outputs/           # Generated masks & heatmaps
```

---

## 3. Component Specifications

### 3.1 VGG16 Classifier

**Purpose**: Classify MRI scans into 4 tumor categories  
**Architecture**: Transfer learning from ImageNet  
**Input**: 128x128x3 RGB image  
**Output**: 4-class probability distribution  

```python
Model: VGG16 (Pre-trained)
├── Block 1: Conv(64) → Conv(64) → MaxPool
├── Block 2: Conv(128) → Conv(128) → MaxPool
├── Block 3: Conv(256) → Conv(256) → Conv(256) → MaxPool
├── Block 4: Conv(512) → Conv(512) → Conv(512) → MaxPool
├── Block 5: Conv(512) → Conv(512) → Conv(512) → MaxPool
├── Flatten
├── Dense(256, relu)
├── Dropout(0.5)
└── Dense(4, softmax)  # Output layer
```

**Training Details**:
- Optimizer: Adam (lr=0.0001)
- Loss: Categorical Crossentropy
- Metrics: Accuracy
- Data Augmentation: Rotation, Flip, Zoom

### 3.2 U-Net Segmentation

**Purpose**: Generate pixel-level tumor masks  
**Architecture**: Encoder-Decoder with skip connections  
**Input**: 256x256x3 RGB image  
**Output**: 256x256x1 binary mask  

```python
U-Net Architecture:
Encoder (Contracting Path):
├── Conv(64) → Conv(64) → MaxPool  [128x128]
├── Conv(128) → Conv(128) → MaxPool [64x64]
├── Conv(256) → Conv(256) → MaxPool [32x32]
└── Conv(512) → Conv(512) → MaxPool [16x16]

Bottleneck:
└── Conv(1024) → Conv(1024)        [16x16]

Decoder (Expanding Path):
├── UpConv(512) + Skip → Conv(512) → Conv(512) [32x32]
├── UpConv(256) + Skip → Conv(256) → Conv(256) [64x64]
├── UpConv(128) + Skip → Conv(128) → Conv(128) [128x128]
├── UpConv(64) + Skip → Conv(64) → Conv(64)    [256x256]
└── Conv(1, sigmoid)  # Output layer
```

**Training Details**:
- Loss: Dice Loss (custom)
- Optimizer: Adam
- Dataset: BraTS 2020 (Brain Tumor Segmentation)

### 3.3 Grad-CAM (Explainable AI)

**Purpose**: Generate visual attention heatmaps  
**Method**: Gradient-weighted Class Activation Mapping  
**Target Layer**: `block5_conv3` (last conv layer)  

**Algorithm**:
```python
1. Forward pass: Get predictions
2. Backward pass: Compute gradients of target class w.r.t. feature maps
3. Global average pooling of gradients → weights
4. Weighted combination of feature maps
5. ReLU activation (keep positive influences)
6. Resize to original image size
7. Apply colormap (jet) for visualization
```

### 3.4 Symbolic Reasoner

**Purpose**: Convert neural outputs to medical explanations  
**Type**: Rule-based expert system  
**Input**: AI facts (class, volume, location, shape)  
**Output**: Medical explanation + treatment plan  

**Knowledge Base**:
```python
medical_context = {
    "glioma": {
        "origin": "Glial cells",
        "etiology": "IDH mutations, infiltrative",
        "behavior": "Low-grade to high-grade (GBM)"
    },
    "meningioma": {
        "origin": "Meninges",
        "etiology": "NF2 gene, often benign",
        "behavior": "Compresses brain tissue"
    },
    "pituitary": {
        "origin": "Pituitary gland",
        "etiology": "Hormonal imbalances",
        "behavior": "Visual field defects"
    }
}
```

**Logic Rules**:
- IF tumor_type == "glioma" AND volume > 5 cm² → Severity = 90
- IF IDH == "Wildtype" → Add 15 to severity, aggressive treatment
- IF MGMT == "Methylated" → Recommend Temozolomide chemotherapy

---

## 4. Data Models

### 4.1 User Model

```python
class User(BaseModel):
    username: str              # Unique identifier
    email: str                 # Contact email
    full_name: str             # Display name
    role: str                  # "doctor" or "student"
    hashed_password: str       # bcrypt hashed
```

### 4.2 Patient Model

```python
class Patient(BaseModel):
    id: PyObjectId             # MongoDB ObjectId
    patient_id: str            # Unique patient identifier
    full_name: str             # Patient's full name
    date_of_birth: str         # Format: YYYY-MM-DD
    medical_history_summary: str  # Brief medical history
```

### 4.3 Study Model

```python
class Study(BaseModel):
    id: PyObjectId             # MongoDB ObjectId
    patient_id: str            # Foreign key to Patient
    study_date: datetime       # Scan date (auto-generated)
    mri_image_path: str        # Path to original MRI
    seg_mask_path: str         # Path to segmentation mask
    grad_cam_path: str         # Path to Grad-CAM heatmap
    
    # AI Analysis Results
    ai_facts: Dict = {
        "predicted_class": str,       # glioma/meningioma/pituitary/notumor
        "confidence": float,          # 0.0 to 1.0
        "tumor_volume_cm2": float,    # Calculated from mask
        "affected_lobes": List[str],  # Brain regions
        "shape_irregularity": float   # 0.0 (circular) to 1.0 (irregular)
    }
    
    # Symbolic Reasoning Outputs
    final_explanation: str     # Medical explanation
    doctor_notes: str          # Doctor's annotations
    
    # Treatment Plan
    treatment: Dict = {
        "severity_score": int,        # 0-100
        "action": str,                # Clinical action
        "follow_up": str,             # Follow-up schedule
        "protocol": List[str]         # Treatment steps
    }
    
    # Multi-Modal Data
    idh_status: str            # "Mutant" / "Wildtype" / "Unknown"
    mgmt_status: str           # "Methylated" / "Unmethylated" / "Unknown"
```

### 4.4 Quiz Model

```python
class QuizQuestion(BaseModel):
    question: str              # Question text
    options: List[str]         # Multiple choice options
    correct_answer: int        # Index of correct option
    explanation: str           # Why this answer is correct
```

---

## 5. API Endpoints

### 5.1 Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/token` | Login and get JWT token | `username`, `password` (form-data) | `{access_token, token_type}` |
| GET | `/auth/users/me` | Get current user info | None (requires auth header) | `{username, email, full_name, role}` |

### 5.2 Patient Management Endpoints

| Method | Endpoint | Description | Auth Required | Request/Response |
|--------|----------|-------------|---------------|------------------|
| POST | `/patients` | Create new patient | ✅ | Body: `Patient` model → Returns created patient |
| GET | `/patients` | Get all patients | ✅ | Returns: `List[Patient]` |
| GET | `/patients/{patient_id}` | Get patient details + studies | ✅ | Returns: `{patient: Patient, studies: List[Study]}` |
| DELETE | `/patients/{patient_id}` | Delete patient and all studies | ✅ | Returns: 204 No Content |

### 5.3 Study/Analysis Endpoints

| Method | Endpoint | Description | Parameters | Response |
|--------|----------|-------------|------------|----------|
| POST | `/studies/upload` | Upload MRI and run AI analysis | `patient_id` (form), `file` (file), `idh_status` (form), `mgmt_status` (form) | `{image_paths, prediction, explanation}` |
| POST | `/studies/{study_id}/update-mask` | Update segmentation mask | `study_id` (path), `file` (file) | `{message, new_facts}` |

### 5.4 Chatbot Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/edu/chat` | Send message to NeuroEdu bot | `{message: str, image_base64?: str}` | `{response: str}` |

### 5.5 Quiz Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/quiz/questions` | Get random quiz questions | `List[QuizQuestion]` (5 questions) |

---

## 6. AI/ML Pipeline Details

### 6.1 Pipeline Stages

#### Stage 1: Classification (VGG16)
```python
Input: MRI image (any size)
↓
Preprocessing:
  - Resize to 128x128
  - Normalize to [0, 1]
  - Convert to RGB if grayscale
↓
Model Inference:
  - Forward pass through VGG16
  - Get 4-class probabilities
↓
Output:
  - predicted_class: str
  - confidence: float
```

#### Stage 2: Segmentation (U-Net + Grad-CAM)
```python
IF predicted_class != "notumor":
    
    # Generate Grad-CAM
    Grad-CAM:
      - Target layer: block5_conv3
      - Generate attention heatmap
      - Save as overlay image
    
    # Run U-Net
    U-Net:
      - Resize image to 256x256
      - Forward pass
      - Get binary mask
    
    # Quality Check
    IF mask.max() > 0.01:
        Use U-Net mask
    ELSE:
        Fallback to Grad-CAM:
          - Resize heatmap to 256x256
          - Apply Otsu thresholding
          - Use as mask
    
    # Extract Facts
    Facts:
      - Volume: count_pixels / 500
      - Location: calculate_centroid → map to lobe
      - Irregularity: 1 - circularity
```

#### Stage 3: Symbolic Reasoning
```python
Input: AI facts + Genetic data

# Generate Explanation
IF genetics available:
    Combine visual + genetic context
    Apply multi-modal logic rules
ELSE:
    Use visual-only reasoning

# Generate Treatment Plan
Match tumor_type:
  - Glioma: Check IDH/MGMT → Adjust severity & protocol
  - Meningioma: Check volume → Surveillance vs Surgery
  - Pituitary: Check volume → Micro vs Macro adenoma

Output:
  - Medical explanation (text)
  - Treatment plan (structured)
  - Severity score (0-100)
```

### 6.2 Fact Extraction Algorithms

#### Volume Calculation
```python
def calculate_volume(mask):
    binary_mask = threshold(mask, 127)
    pixel_count = count_nonzero(binary_mask)
    PIXEL_AREA_PER_CM2 = 500  # Calibration constant
    volume_cm2 = pixel_count / PIXEL_AREA_PER_CM2
    return round(volume_cm2, 2)
```

#### Location Detection
```python
def find_location(mask):
    moments = cv2.moments(mask)
    if moments["m00"] > 0:
        center_y = moments["m01"] / moments["m00"]
        height = mask.shape[0]
        
        if center_y < height / 3:
            return ["frontal_lobe"]
        elif center_y > height * 2 / 3:
            return ["temporal_lobe"]
        else:
            return ["parietal_lobe"]
```

#### Shape Irregularity
```python
def calculate_irregularity(mask):
    contours = find_contours(mask)
    largest_contour = max(contours, key=area)
    
    perimeter = arc_length(largest_contour)
    area = contour_area(largest_contour)
    
    circularity = (4 * π * area) / (perimeter²)
    irregularity = 1.0 - circularity
    
    return round(irregularity, 2)
```

---

## 7. Frontend Components

### 7.1 State Management

**Global State** (App.js):
```javascript
const [currentPage, setCurrentPage] = useState("login")
const [currentUser, setCurrentUser] = useState(null)
const [currentPatientId, setCurrentPatientId] = useState(null)
const [token, setToken] = useState(localStorage.getItem("accessToken"))
```

**Component-Level State Examples**:
```javascript
// PatientDetail.js
const [patient, setPatient] = useState(null)
const [studies, setStudies] = useState([])
const [compareMode, setCompareMode] = useState(false)
const [editingStudyId, setEditingStudyId] = useState(null)

// NeuroEduBot.js
const [messages, setMessages] = useState([])
const [input, setInput] = useState("")
const [isLoading, setIsLoading] = useState(false)
```

### 7.2 Key Component Implementations

#### MaskEditor Component
```javascript
Features:
  - HTML5 Canvas (256x256)
  - Tools: Brush, Eraser
  - Adjustable brush size (2-20 pixels)
  - Real-time drawing
  - Save as PNG blob
  - Upload to server for recalculation

Implementation:
  - useRef for canvas reference
  - Mouse event handlers (onMouseDown, onMouseMove, onMouseUp)
  - Canvas 2D context for drawing
  - toBlob() for export
```

#### GenomicPanel Component
```javascript
Purpose: Display multi-modal genetic data

Visual Indicators:
  IDH Mutant:     ✅ Green (Better Prognosis)
  IDH Wildtype:   ⚠️ Amber (Aggressive)
  MGMT Methylated: ✅ Green (Chemo-Responsive)
  MGMT Unmethylated: ⚠️ Amber (Resistant)

Styling:
  - Gradient background (purple/indigo)
  - Border with glow effect
  - Icon + Status + Impact description
```

#### PDF Report Generation
```javascript
Process:
  1. Render hidden MedicalReportTemplate component
  2. Populate with patient data, studies, charts
  3. Use html2canvas to capture DOM as images
  4. Create jsPDF document
  5. Add images page by page
  6. Download as PDF file

Libraries:
  - html2canvas: DOM → Canvas
  - jsPDF: Canvas → PDF
  - Chart.js: Progression charts
```

---

## 8. Security & Authentication

### 8.1 JWT Authentication Flow

```python
# Token Generation
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Token Validation
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user
```

### 8.2 Password Security

```python
# Hashing
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### 8.3 CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 9. Performance Considerations

### 9.1 Model Loading Strategy

**Problem**: Loading TensorFlow models on every request is slow  
**Solution**: Load models once at startup (future optimization)

```python
# Current: Load per request
clf_model = tf.keras.models.load_model(CLASSIFICATION_MODEL_PATH)

# Optimized: Load at startup (recommended)
@app.on_event("startup")
async def load_models():
    global clf_model, seg_model
    clf_model = tf.keras.models.load_model(CLASSIFICATION_MODEL_PATH)
    seg_model = tf.keras.models.load_model(SEGMENTATION_MODEL_PATH)
```

### 9.2 Image Processing Optimization

- **Async File I/O**: Use `aiofiles` for non-blocking file operations
- **Lazy Loading**: Load images only when needed
- **Caching**: Store processed images to avoid reprocessing
- **Compression**: Use PNG compression for masks

### 9.3 Database Optimization

- **Indexing**: Create index on `patient_id` for fast lookups
- **Projection**: Fetch only required fields
- **Pagination**: Limit query results for large datasets

```python
# Index creation
await db.patients.create_index("patient_id", unique=True)
await db.studies.create_index("patient_id")
```

---

## 10. Deployment Architecture

### 10.1 Development Environment

```
Frontend:
  - React Dev Server (localhost:3000)
  - Hot Module Replacement (HMR)

Backend:
  - Uvicorn with --reload (localhost:8000)
  - Auto-restart on code changes

Database:
  - MongoDB Atlas (cloud) or Local MongoDB

File Storage:
  - Local filesystem (backend_simple/uploads/)
```

### 10.2 Production Deployment (Recommended)

```
Frontend:
  - Build: npm run build
  - Serve: Nginx or Vercel
  - CDN: CloudFlare for static assets

Backend:
  - ASGI Server: Gunicorn + Uvicorn workers
  - Reverse Proxy: Nginx
  - SSL: Let's Encrypt

Database:
  - MongoDB Atlas (managed service)
  - Replica Set for high availability

File Storage:
  - AWS S3 or Azure Blob Storage
  - CDN for image delivery

AI Models:
  - TensorFlow Serving (model server)
  - GPU acceleration (CUDA)
```

### 10.3 Scaling Considerations

**Horizontal Scaling**:
- Load balancer (Nginx/HAProxy)
- Multiple FastAPI instances
- Shared file storage (S3)
- Centralized MongoDB cluster

**Vertical Scaling**:
- GPU for faster inference
- More RAM for model caching
- SSD for faster I/O

---

## 📚 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18 | UI framework |
| | Tailwind CSS | 3.x | Styling |
| | Axios | Latest | HTTP client |
| | Chart.js | 4.x | Data visualization |
| | html2canvas | Latest | DOM to image |
| | jsPDF | Latest | PDF generation |
| **Backend** | FastAPI | Latest | Web framework |
| | Python | 3.9+ | Programming language |
| | Uvicorn | Latest | ASGI server |
| | Motor | Latest | Async MongoDB driver |
| | PyJWT | Latest | JWT authentication |
| | Passlib | Latest | Password hashing |
| **AI/ML** | TensorFlow | 2.19 | Deep learning |
| | OpenCV | Latest | Image processing |
| | NumPy | Latest | Numerical computing |
| | PyDicom | Latest | DICOM file handling |
| **Database** | MongoDB | 6.x | NoSQL database |
| **External** | OpenAI API | GPT-4o | Chatbot intelligence |

---

*This detailed design document serves as the technical blueprint for the AI Visualizer Project. For implementation details, refer to the source code and inline documentation.*
