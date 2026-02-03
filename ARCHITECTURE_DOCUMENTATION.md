# 🧠 Neurosymbolic AI - Architecture Documentation

> **Note**: To view diagrams, press `Ctrl+Shift+V` in VS Code to open Markdown Preview

---

## 📋 Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Use Case Diagrams](#2-use-case-diagrams)
3. [Sequence Diagrams](#3-sequence-diagrams)
4. [Activity Diagrams](#4-activity-diagrams)
5. [Data Flow Diagrams](#5-data-flow-diagrams)
6. [Class Diagrams](#6-class-diagrams)

---

## 1. System Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend - React"
        UI[User Interface]
        DoctorUI[Doctor Portal]
        StudentUI[Student Learning Lab]
        Canvas[HTML5 Canvas Editor]
        Charts[Chart.js Visualizations]
    end
    
    subgraph "Backend - FastAPI"
        API[FastAPI Server]
        Auth[Authentication Module]
        PatientRoutes[Patient Routes]
        ChatbotRoutes[Chatbot Routes]
        QuizRoutes[Quiz Routes]
    end
    
    subgraph "AI Pipeline"
        CNN[VGG16 Classifier]
        UNet[U-Net Segmentation]
        GradCAM[Grad-CAM XAI]
        Reasoner[Symbolic Reasoner]
    end
    
    subgraph "Data Layer"
        MongoDB[(MongoDB Database)]
        FileStorage[File Storage - Uploads]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI GPT-4o API]
    end
    
    UI --> API
    DoctorUI --> PatientRoutes
    StudentUI --> ChatbotRoutes
    StudentUI --> QuizRoutes
    
    PatientRoutes --> CNN
    PatientRoutes --> UNet
    CNN --> GradCAM
    UNet --> Reasoner
    GradCAM --> Reasoner
    
    API --> Auth
    API --> MongoDB
    API --> FileStorage
    ChatbotRoutes --> OpenAI
    
    style CNN fill:#4f46e5
    style UNet fill:#4f46e5
    style GradCAM fill:#4f46e5
    style Reasoner fill:#7c3aed
    style MongoDB fill:#10b981
    style OpenAI fill:#f59e0b
```

### Technology Stack

```mermaid
graph LR
    subgraph "Frontend Stack"
        React[React 18]
        TailwindCSS[Tailwind CSS]
        ChartJS[Chart.js]
        Axios[Axios]
    end
    
    subgraph "Backend Stack"
        FastAPI[FastAPI]
        TensorFlow[TensorFlow 2.19]
        Motor[Motor AsyncIO]
        PyDicom[PyDicom]
    end
    
    subgraph "Database"
        Mongo[MongoDB]
    end
    
    subgraph "AI/ML"
        VGG16[VGG16 CNN]
        UNetModel[U-Net]
        OpenCV[OpenCV]
    end
    
    React --> FastAPI
    FastAPI --> Mongo
    FastAPI --> VGG16
    FastAPI --> UNetModel
    
    style React fill:#61dafb
    style FastAPI fill:#009688
    style Mongo fill:#47a248
    style VGG16 fill:#ff6f00
```

---

## 2. Use Case Diagrams

### Doctor Portal Use Cases

```mermaid
graph TB
    Doctor((Doctor))
    
    Doctor --> UC1[Login to System]
    Doctor --> UC2[View Patient List]
    Doctor --> UC3[Upload MRI Scan]
    Doctor --> UC4[Add Genetic Data]
    Doctor --> UC5[View AI Analysis]
    Doctor --> UC6[Edit Segmentation Mask]
    Doctor --> UC7[Compare Scans]
    Doctor --> UC8[Generate PDF Report]
    Doctor --> UC9[Add Doctor Notes]
    Doctor --> UC10[View Treatment Plan]
    
    UC3 --> UC5
    UC4 --> UC5
    UC5 --> UC6
    UC5 --> UC10
    UC2 --> UC7
    UC5 --> UC8
    
    style Doctor fill:#4f46e5,color:#fff
    style UC3 fill:#10b981
    style UC5 fill:#f59e0b
    style UC8 fill:#ef4444
```

### Student Portal Use Cases

```mermaid
graph TB
    Student((Student))
    
    Student --> S1[Login to System]
    Student --> S2[Browse Learning Modules]
    Student --> S3[Study Brain Anatomy]
    Student --> S4[Learn Tumor Types]
    Student --> S5[View AI Architecture]
    Student --> S6[Take Diagnosis Challenge]
    Student --> S7[Chat with NeuroEdu Bot]
    Student --> S8[Take Quiz]
    Student --> S9[View 3D Neural Network]
    
    S2 --> S3
    S2 --> S4
    S2 --> S5
    S6 --> S7
    S8 --> S7
    
    style Student fill:#7c3aed,color:#fff
    style S6 fill:#f59e0b
    style S7 fill:#10b981
```

---

## 3. Sequence Diagrams

### 3.1 User Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant FastAPI
    participant Auth
    participant MongoDB
    
    User->>Frontend: Enter credentials
    Frontend->>FastAPI: POST /auth/token
    FastAPI->>Auth: validate_credentials()
    Auth->>MongoDB: find_user(username)
    MongoDB-->>Auth: user_data
    Auth->>Auth: verify_password()
    Auth-->>FastAPI: JWT Token
    FastAPI-->>Frontend: {access_token, token_type}
    Frontend->>Frontend: Store token in localStorage
    Frontend->>FastAPI: GET /auth/users/me
    Note over FastAPI: Authorization: Bearer {token}
    FastAPI->>Auth: get_current_user()
    Auth-->>FastAPI: user_object
    FastAPI-->>Frontend: {username, role, full_name}
    Frontend->>Frontend: Redirect to Dashboard
```

### 3.2 MRI Upload and AI Analysis Pipeline

```mermaid
sequenceDiagram
    actor Doctor
    participant Frontend
    participant API
    participant PatientRoutes
    participant AIPipeline
    participant CNN
    participant UNet
    participant GradCAM
    participant Reasoner
    participant MongoDB
    participant FileStorage
    
    Doctor->>Frontend: Upload MRI + Genetic Data
    Frontend->>API: POST /studies/upload
    Note over API: FormData: file, patient_id,<br/>idh_status, mgmt_status
    
    API->>PatientRoutes: upload_and_analyze()
    PatientRoutes->>PatientRoutes: Load VGG16 & U-Net models
    PatientRoutes->>FileStorage: Save uploaded image
    
    PatientRoutes->>AIPipeline: run_simple_analysis()
    
    rect rgb(79, 70, 229)
        Note over AIPipeline,CNN: Stage 1: Classification
        AIPipeline->>CNN: predict(image)
        CNN-->>AIPipeline: {class, confidence}
    end
    
    rect rgb(124, 58, 237)
        Note over AIPipeline,UNet: Stage 2: Segmentation
        AIPipeline->>UNet: predict(image)
        UNet-->>AIPipeline: segmentation_mask
        AIPipeline->>GradCAM: generate_grad_cam()
        GradCAM-->>AIPipeline: attention_heatmap
        AIPipeline->>FileStorage: Save mask & Grad-CAM
    end
    
    rect rgb(16, 185, 129)
        Note over AIPipeline,Reasoner: Stage 3: Symbolic Reasoning
        AIPipeline->>AIPipeline: extract_facts_from_mask()
        AIPipeline->>Reasoner: generate_explanation(ai_facts, genetics)
        Reasoner-->>AIPipeline: medical_explanation
        AIPipeline->>Reasoner: generate_treatment_plan()
        Reasoner-->>AIPipeline: treatment_protocol
    end
    
    AIPipeline-->>PatientRoutes: analysis_results
    PatientRoutes->>MongoDB: Insert Study document
    PatientRoutes-->>Frontend: {prediction, explanation, treatment}
    Frontend->>Frontend: Display results
```

### 3.3 Multi-Modal Analysis with Genetic Data

```mermaid
sequenceDiagram
    actor Doctor
    participant Frontend
    participant Backend
    participant Reasoner
    participant Database
    
    Doctor->>Frontend: Upload MRI + IDH/MGMT status
    Frontend->>Backend: POST /studies/upload<br/>{file, idh_status, mgmt_status}
    
    Backend->>Backend: Run CNN Classification
    Backend->>Backend: Run U-Net Segmentation
    Backend->>Backend: Extract visual facts
    
    Note over Backend,Reasoner: Multi-Modal Integration
    Backend->>Reasoner: generate_explanation(ai_facts, genetics)
    
    alt IDH Mutant
        Reasoner->>Reasoner: "Better prognosis, Low Grade Glioma"
    else IDH Wildtype
        Reasoner->>Reasoner: "Aggressive, Glioblastoma-like"
    end
    
    alt MGMT Methylated
        Reasoner->>Reasoner: "Chemo-responsive (Temozolomide)"
    else MGMT Unmethylated
        Reasoner->>Reasoner: "Chemo-resistant"
    end
    
    Reasoner-->>Backend: Combined explanation
    Backend->>Reasoner: generate_treatment_plan(ai_facts, genetics)
    Reasoner-->>Backend: Adjusted treatment protocol
    
    Backend->>Database: Save study with genetic markers
    Backend-->>Frontend: Full analysis results
    Frontend->>Frontend: Display Genomic Panel
```

### 3.4 PDF Report Generation

```mermaid
sequenceDiagram
    actor Doctor
    participant Frontend
    participant ReportTemplate
    participant html2canvas
    participant jsPDF
    
    Doctor->>Frontend: Click "Generate PDF"
    Frontend->>Frontend: Prepare chart data
    Frontend->>ReportTemplate: Render hidden report
    Note over ReportTemplate: Contains patient info,<br/>studies, images, charts
    
    ReportTemplate->>html2canvas: Capture DOM as canvas
    html2canvas-->>ReportTemplate: Canvas images
    
    ReportTemplate->>jsPDF: Create PDF document
    loop For each page
        jsPDF->>jsPDF: Add canvas as image
    end
    
    jsPDF-->>Frontend: PDF Blob
    Frontend->>Frontend: Download PDF file
    Frontend->>Doctor: "Report_PatientID_Date.pdf"
```

---

## 4. Activity Diagrams

### 4.1 AI Pipeline Processing Flow

```mermaid
stateDiagram-v2
    [*] --> ReceiveImage: MRI Upload
    
    ReceiveImage --> ValidateFormat: Check file type
    ValidateFormat --> ProcessDICOM: Is .dcm?
    ValidateFormat --> SaveImage: Is .png/.jpg?
    ProcessDICOM --> ExtractMetadata
    ExtractMetadata --> ConvertToPNG
    ConvertToPNG --> SaveImage
    
    SaveImage --> LoadModels: Load VGG16 & U-Net
    LoadModels --> PreprocessClassify: Resize to 128x128
    PreprocessClassify --> RunCNN: Classification
    
    RunCNN --> CheckTumor: predicted_class?
    CheckTumor --> SkipSegmentation: "notumor"
    CheckTumor --> RunSegmentation: Tumor detected
    
    RunSegmentation --> PreprocessSegment: Resize to 256x256
    PreprocessSegment --> RunUNet: Segmentation
    RunUNet --> GenerateGradCAM: XAI Heatmap
    GenerateGradCAM --> CheckMaskQuality: Mask valid?
    
    CheckMaskQuality --> UseMask: U-Net success
    CheckMaskQuality --> FallbackGradCAM: Blank mask
    FallbackGradCAM --> UseMask
    
    UseMask --> ExtractFacts: Calculate volume,<br/>location, shape
    ExtractFacts --> SymbolicReasoning
    SkipSegmentation --> SymbolicReasoning
    
    SymbolicReasoning --> GenerateExplanation: Medical context
    GenerateExplanation --> GenerateTreatment: NCCN protocols
    GenerateTreatment --> SaveStudy: Store in MongoDB
    SaveStudy --> [*]: Return results
```

### 4.2 Neurosymbolic Reasoning Workflow

```mermaid
stateDiagram-v2
    [*] --> ReceiveFacts: AI Facts Input
    
    state "Neural Output" as Neural {
        [*] --> PredictedClass
        PredictedClass --> Confidence
        Confidence --> TumorVolume
        TumorVolume --> AffectedLobes
        AffectedLobes --> ShapeIrregularity
    }
    
    ReceiveFacts --> Neural
    Neural --> CheckGenetics: Genetic data available?
    
    state "Multi-Modal Integration" as MultiModal {
        CheckGenetics --> IDHStatus: Yes
        IDHStatus --> MGMTStatus
        MGMTStatus --> CombineFacts
    }
    
    CheckGenetics --> SymbolicRules: No
    MultiModal --> SymbolicRules
    
    state "Symbolic Reasoning" as Symbolic {
        SymbolicRules --> ApplyMedicalContext
        ApplyMedicalContext --> ApplyLogicRules
        ApplyLogicRules --> CalculateSeverity
    }
    
    Symbolic --> GenerateOutput
    
    state "Output Generation" as Output {
        GenerateOutput --> MedicalExplanation
        MedicalExplanation --> TreatmentProtocol
        TreatmentProtocol --> SeverityScore
    }
    
    Output --> [*]: Return to API
```

---

## 5. Data Flow Diagrams

### 5.1 DFD Level 0 (Context Diagram)

```mermaid
graph TB
    Doctor((Doctor))
    Student((Student))
    
    subgraph "Neurosymbolic AI System"
        System[AI Diagnosis &<br/>Learning Platform]
    end
    
    OpenAI[OpenAI API]
    FileSystem[(File Storage)]
    Database[(MongoDB)]
    
    Doctor -->|MRI Scans + Genetic Data| System
    System -->|Diagnosis Reports| Doctor
    Doctor -->|Patient Management| System
    System -->|Patient Records| Doctor
    
    Student -->|Learning Queries| System
    System -->|Educational Content| Student
    Student -->|Quiz Answers| System
    System -->|Scores & Feedback| Student
    
    System -->|Store Images| FileSystem
    FileSystem -->|Retrieve Images| System
    
    System -->|Store/Query Data| Database
    Database -->|Patient/Study Data| System
    
    System -->|Chat Messages| OpenAI
    OpenAI -->|AI Responses| System
    
    style System fill:#4f46e5,color:#fff
    style Doctor fill:#10b981,color:#fff
    style Student fill:#7c3aed,color:#fff
```

### 5.2 DFD Level 1 (Detailed Data Flows)

```mermaid
graph TB
    subgraph "External Entities"
        Doctor((Doctor))
        Student((Student))
        OpenAI[OpenAI API]
    end
    
    subgraph "Neurosymbolic AI System"
        Auth[1.0<br/>Authentication]
        PatientMgmt[2.0<br/>Patient Management]
        AIPipeline[3.0<br/>AI Analysis Pipeline]
        Reporting[4.0<br/>Report Generation]
        Learning[5.0<br/>Learning Lab]
        Chatbot[6.0<br/>AI Chatbot]
    end
    
    subgraph "Data Stores"
        D1[(D1: Users)]
        D2[(D2: Patients)]
        D3[(D3: Studies)]
        D4[(D4: Quiz Data)]
        D5[D5: Image Files]
    end
    
    Doctor -->|Credentials| Auth
    Auth -->|JWT Token| Doctor
    Auth <-->|User Data| D1
    
    Doctor -->|Patient Info| PatientMgmt
    PatientMgmt <-->|Patient Records| D2
    PatientMgmt -->|Patient List| Doctor
    
    Doctor -->|MRI + Genetics| AIPipeline
    AIPipeline -->|Store Images| D5
    D5 -->|Load Images| AIPipeline
    AIPipeline -->|Study Data| D3
    AIPipeline -->|Analysis Results| Doctor
    
    Doctor -->|Request Report| Reporting
    Reporting -->|Query Studies| D3
    D3 -->|Study History| Reporting
    Reporting -->|Load Images| D5
    Reporting -->|PDF Report| Doctor
    
    Student -->|Access Modules| Learning
    Learning -->|Educational Content| Student
    Student -->|Quiz Submission| Learning
    Learning <-->|Quiz Data| D4
    
    Student -->|Chat Message| Chatbot
    Chatbot -->|API Request| OpenAI
    OpenAI -->|AI Response| Chatbot
    Chatbot -->|Answer| Student
    
    style AIPipeline fill:#4f46e5,color:#fff
    style Auth fill:#10b981,color:#fff
    style Chatbot fill:#f59e0b,color:#fff
```

---

## 6. Class Diagrams

### 6.1 Backend Data Models

```mermaid
classDiagram
    class User {
        +String username
        +String email
        +String full_name
        +String role
        +String hashed_password
    }
    
    class Patient {
        +PyObjectId id
        +String patient_id
        +String full_name
        +String date_of_birth
        +String medical_history_summary
    }
    
    class Study {
        +PyObjectId id
        +String patient_id
        +DateTime study_date
        +String mri_image_path
        +String seg_mask_path
        +String grad_cam_path
        +Dict ai_facts
        +String final_explanation
        +String doctor_notes
        +Dict treatment
        +String idh_status
        +String mgmt_status
    }
    
    class AIFacts {
        +String predicted_class
        +Float confidence
        +Float tumor_volume_cm2
        +List~String~ affected_lobes
        +Float shape_irregularity
    }
    
    class Treatment {
        +Int severity_score
        +String action
        +String follow_up
        +List~String~ protocol
    }
    
    Patient "1" --> "*" Study : has
    Study "1" --> "1" AIFacts : contains
    Study "1" --> "1" Treatment : includes
    User "1" --> "*" Study : creates
```

### 6.2 AI Pipeline Components

```mermaid
classDiagram
    class AIPipeline {
        +run_simple_analysis(image_path, filename, clf_model, seg_model)
        +preprocess_image(image_path, size)
        +extract_facts_from_mask(mask)
    }
    
    class VGG16Classifier {
        +predict(image_array)
        -IMAGE_SIZE: (128, 128)
        -CLASSES: List
    }
    
    class UNetSegmentation {
        +predict(image_array)
        -IMAGE_SIZE: (256, 256)
        +dice_loss(y_true, y_pred)
    }
    
    class GradCAM {
        +generate_grad_cam(model, image, layer_name, pred_index)
        +save_grad_cam_overlay(original_img, heatmap, output_path)
        -LAST_CONV_LAYER: "block5_conv3"
    }
    
    class SymbolicReasoner {
        +Dict medical_context
        +Dict rules
        +generate_explanation(ai_facts, genetics)
        +generate_treatment_plan(ai_facts, genetics)
    }
    
    class MaskProcessor {
        +binarize_mask(mask)
        +calculate_volume(mask)
        +find_location(mask)
        +calculate_irregularity(mask)
    }
    
    AIPipeline --> VGG16Classifier : uses
    AIPipeline --> UNetSegmentation : uses
    AIPipeline --> GradCAM : uses
    AIPipeline --> MaskProcessor : uses
    AIPipeline --> SymbolicReasoner : uses
    
    SymbolicReasoner --> AIFacts : processes
```

### 6.3 Frontend Component Hierarchy

```mermaid
classDiagram
    class App {
        +currentPage: String
        +currentUser: User
        +token: String
        +handleLogin()
        +handleLogout()
        +navigateTo()
    }
    
    class Navbar {
        +currentUser: User
        +render()
    }
    
    class LoginPage {
        +username: String
        +password: String
        +handleSubmit()
    }
    
    class DoctorDashboard {
        +patients: List
        +fetchPatients()
        +handleDelete()
    }
    
    class PatientDetail {
        +patient: Patient
        +studies: List
        +compareMode: Boolean
        +generatePDF()
    }
    
    class AnalysisPage {
        +selectedFile: File
        +idhStatus: String
        +mgmtStatus: String
        +handleUpload()
    }
    
    class LearningLabPage {
        +modules: List
        +render()
    }
    
    class NeuroEduBot {
        +messages: List
        +sendMessage()
        +handleImageUpload()
    }
    
    class MaskEditor {
        +tool: String
        +brushSize: Int
        +handleSave()
    }
    
    class GenomicPanel {
        +study: Study
        +displayIDHStatus()
        +displayMGMTStatus()
    }
    
    App --> Navbar
    App --> LoginPage
    App --> DoctorDashboard
    App --> PatientDetail
    App --> AnalysisPage
    App --> LearningLabPage
    App --> NeuroEduBot
    
    PatientDetail --> MaskEditor
    PatientDetail --> GenomicPanel
```

---

## 📚 Additional Resources

- **Mermaid Documentation**: [mermaid.js.org](https://mermaid.js.org/)
- **Live Editor**: [mermaid.live](https://mermaid.live)
- **Project README**: [README.md](./README.md)

---

## 🔄 Diagram Updates

These diagrams are living documents. To update:

1. Edit the Mermaid code blocks directly in this file
2. Preview changes with `Ctrl+Shift+V`
3. Export diagrams using Mermaid Chart extension if needed

---

*Generated for AI Visualizer Project - Neurosymbolic Brain Tumor Diagnosis System*
