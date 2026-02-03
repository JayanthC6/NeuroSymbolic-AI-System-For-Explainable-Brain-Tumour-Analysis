# 🔄 AI Visualizer Project - Comprehensive Flowchart Documentation

> **Note**: To view diagrams, press `Ctrl+Shift+V` in VS Code to open Markdown Preview

---

## 📋 Table of Contents

1. [System-Level Flowcharts](#1-system-level-flowcharts)
2. [AI Pipeline Flowcharts](#2-ai-pipeline-flowcharts)
3. [User Interaction Flowcharts](#3-user-interaction-flowcharts)
4. [Data Processing Flowcharts](#4-data-processing-flowcharts)
5. [Authentication & Authorization Flow](#5-authentication--authorization-flow)
6. [Multi-Modal Analysis Flow](#6-multi-modal-analysis-flow)

---

## 1. System-Level Flowcharts

### 1.1 Complete System Workflow

```mermaid
flowchart TD
    Start([User Accesses System]) --> Login{User Type?}
    
    Login -->|Doctor| DoctorAuth[Doctor Authentication]
    Login -->|Student| StudentAuth[Student Authentication]
    
    DoctorAuth --> DoctorDash[Doctor Dashboard]
    StudentAuth --> StudentDash[Student Learning Lab]
    
    DoctorDash --> DoctorActions{Select Action}
    DoctorActions -->|View Patients| ViewPatients[Display Patient List]
    DoctorActions -->|Add Patient| AddPatient[Create New Patient]
    DoctorActions -->|Upload MRI| UploadFlow[MRI Upload Flow]
    DoctorActions -->|Federated Learning| FederatedDash[Federated Dashboard]
    
    ViewPatients --> SelectPatient[Select Patient]
    SelectPatient --> PatientDetail[Patient Detail View]
    
    PatientDetail --> PatientActions{Select Action}
    PatientActions -->|View Studies| DisplayStudies[Show All Studies]
    PatientActions -->|Compare Scans| CompareMode[Comparison Mode]
    PatientActions -->|Edit Mask| MaskEditor[Canvas Mask Editor]
    PatientActions -->|Generate PDF| PDFGen[PDF Report Generation]
    
    UploadFlow --> FileUpload[Upload MRI File]
    FileUpload --> FileType{File Type?}
    FileType -->|DICOM| ProcessDICOM[Extract DICOM Metadata]
    FileType -->|PNG/JPG| DirectProcess[Direct Processing]
    
    ProcessDICOM --> ConvertPNG[Convert to PNG]
    ConvertPNG --> GeneticInput
    DirectProcess --> GeneticInput[Input Genetic Data]
    
    GeneticInput --> AIPipeline[AI Analysis Pipeline]
    AIPipeline --> SaveStudy[Save Study to Database]
    SaveStudy --> DisplayResults[Display Results]
    
    StudentDash --> StudentActions{Select Module}
    StudentActions -->|Brain Anatomy| AnatomyModule[3D Brain Anatomy]
    StudentActions -->|Tumor Types| TumorLibrary[Tumor Knowledge Base]
    StudentActions -->|AI Architecture| AIArchModule[Neural Network Visualization]
    StudentActions -->|Chat Bot| NeuroEduBot[NeuroEdu AI Assistant]
    StudentActions -->|Take Quiz| QuizModule[Interactive Quiz]
    
    NeuroEduBot --> ChatFlow[Chat Interaction]
    ChatFlow --> OpenAIAPI[OpenAI GPT-4o API]
    OpenAIAPI --> BotResponse[AI Response]
    
    QuizModule --> TakeQuiz[Answer Questions]
    TakeQuiz --> SubmitQuiz[Submit Answers]
    SubmitQuiz --> QuizResults[Show Score & Feedback]
    
    DisplayResults --> End([Session Complete])
    QuizResults --> End
    BotResponse --> End
    PDFGen --> End
    
    style AIPipeline fill:#4f46e5,color:#fff
    style OpenAIAPI fill:#f59e0b,color:#fff
    style DoctorDash fill:#10b981,color:#fff
    style StudentDash fill:#7c3aed,color:#fff
```

### 1.2 Application Architecture Flow

```mermaid
flowchart LR
    subgraph Frontend["Frontend Layer (React)"]
        UI[User Interface]
        Components[React Components]
        StateManagement[State Management]
        APIClient[Axios HTTP Client]
    end
    
    subgraph Backend["Backend Layer (FastAPI)"]
        APIGateway[API Gateway]
        AuthMiddleware[JWT Authentication]
        
        subgraph Routes["Route Handlers"]
            AuthRoutes[Auth Routes]
            PatientRoutes[Patient Routes]
            ChatbotRoutes[Chatbot Routes]
            QuizRoutes[Quiz Routes]
        end
        
        subgraph AIEngine["AI Processing Engine"]
            Pipeline[AI Pipeline Manager]
            Classifier[VGG16 Classifier]
            Segmenter[U-Net Segmentation]
            XAI[Grad-CAM XAI]
            Reasoner[Symbolic Reasoner]
        end
    end
    
    subgraph DataLayer["Data Layer"]
        MongoDB[(MongoDB Database)]
        FileStorage[File Storage System]
    end
    
    subgraph External["External Services"]
        OpenAI[OpenAI API]
    end
    
    UI --> Components
    Components --> StateManagement
    StateManagement --> APIClient
    APIClient -->|HTTP/REST| APIGateway
    
    APIGateway --> AuthMiddleware
    AuthMiddleware --> Routes
    
    AuthRoutes --> MongoDB
    PatientRoutes --> Pipeline
    ChatbotRoutes --> OpenAI
    QuizRoutes --> MongoDB
    
    Pipeline --> Classifier
    Classifier --> Segmenter
    Segmenter --> XAI
    XAI --> Reasoner
    
    Reasoner --> MongoDB
    Pipeline --> FileStorage
    
    style AIEngine fill:#4f46e5,color:#fff
    style Frontend fill:#61dafb,color:#000
    style Backend fill:#009688,color:#fff
    style MongoDB fill:#47a248,color:#fff
```

---

## 2. AI Pipeline Flowcharts

### 2.1 Complete AI Analysis Pipeline

```mermaid
flowchart TD
    Start([MRI Image Input]) --> LoadModels[Load AI Models]
    LoadModels --> LoadCNN[Load VGG16 Classifier]
    LoadModels --> LoadUNet[Load U-Net Segmentation]
    
    LoadCNN --> Stage1{Stage 1: Classification}
    LoadUNet --> Stage1
    
    Stage1 --> Preprocess1[Resize to 128x128]
    Preprocess1 --> Normalize1[Normalize 0-1]
    Normalize1 --> RunCNN[Run VGG16 Prediction]
    
    RunCNN --> GetPrediction[Extract Class & Confidence]
    GetPrediction --> CheckTumor{Tumor Detected?}
    
    CheckTumor -->|No Tumor| SkipSegmentation[Skip Segmentation]
    CheckTumor -->|Tumor Found| Stage2{Stage 2: Segmentation}
    
    Stage2 --> Preprocess2[Resize to 256x256]
    Preprocess2 --> RunUNet[Run U-Net Prediction]
    RunUNet --> GenerateGradCAM[Generate Grad-CAM Heatmap]
    
    GenerateGradCAM --> CheckMask{Mask Quality Check}
    CheckMask -->|Valid Mask| UseMask[Use U-Net Mask]
    CheckMask -->|Blank/Poor| Fallback[Fallback to Grad-CAM]
    
    Fallback --> ResizeHeatmap[Resize Heatmap to 256x256]
    ResizeHeatmap --> OtsuThreshold[Apply Otsu Thresholding]
    OtsuThreshold --> UseMask
    
    UseMask --> SaveMask[Save Segmentation Mask]
    SaveMask --> ExtractFacts[Extract Symbolic Facts]
    
    ExtractFacts --> CalcVolume[Calculate Tumor Volume]
    ExtractFacts --> FindLocation[Identify Affected Lobes]
    ExtractFacts --> CalcIrregularity[Measure Shape Irregularity]
    
    CalcVolume --> Stage3{Stage 3: Reasoning}
    FindLocation --> Stage3
    CalcIrregularity --> Stage3
    SkipSegmentation --> Stage3
    
    Stage3 --> CheckGenetics{Genetic Data Available?}
    CheckGenetics -->|Yes| MultiModal[Multi-Modal Integration]
    CheckGenetics -->|No| VisualOnly[Visual-Only Reasoning]
    
    MultiModal --> IntegrateIDH[Integrate IDH Status]
    MultiModal --> IntegrateMGMT[Integrate MGMT Status]
    IntegrateIDH --> CombineData[Combine Visual + Genetic]
    IntegrateMGMT --> CombineData
    
    CombineData --> ApplyRules[Apply Medical Logic Rules]
    VisualOnly --> ApplyRules
    
    ApplyRules --> GenerateExplanation[Generate Medical Explanation]
    GenerateExplanation --> GenerateTreatment[Generate Treatment Plan]
    
    GenerateTreatment --> CalculateSeverity[Calculate Severity Score]
    CalculateSeverity --> SaveStudy[Save to Database]
    
    SaveStudy --> ReturnResults[Return Analysis Results]
    ReturnResults --> End([Complete])
    
    style Stage1 fill:#4f46e5,color:#fff
    style Stage2 fill:#7c3aed,color:#fff
    style Stage3 fill:#10b981,color:#fff
    style MultiModal fill:#f59e0b,color:#fff
```

### 2.2 Neurosymbolic Integration Flow

```mermaid
flowchart TD
    Start([Neural Network Output]) --> NeuralFacts[Extract Neural Facts]
    
    subgraph Neural["Neural Processing (Subsymbolic)"]
        NeuralFacts --> ClassLabel[Predicted Class Label]
        NeuralFacts --> ConfScore[Confidence Score]
        NeuralFacts --> SegMask[Segmentation Mask]
        NeuralFacts --> AttentionMap[Attention Heatmap]
    end
    
    subgraph Bridge["Neural-Symbolic Bridge"]
        ClassLabel --> FactExtraction[Fact Extraction Layer]
        SegMask --> FactExtraction
        
        FactExtraction --> Volume[Tumor Volume cm²]
        FactExtraction --> Location[Affected Brain Lobes]
        FactExtraction --> Shape[Shape Irregularity Index]
        FactExtraction --> Confidence[Prediction Confidence]
    end
    
    subgraph Symbolic["Symbolic Reasoning (Logic-Based)"]
        Volume --> KnowledgeBase[Medical Knowledge Base]
        Location --> KnowledgeBase
        Shape --> KnowledgeBase
        Confidence --> KnowledgeBase
        
        KnowledgeBase --> MedicalContext[Apply Medical Context]
        MedicalContext --> LogicRules[Apply Logic Rules]
        
        LogicRules --> TumorType{Classify Tumor Type}
        TumorType -->|Glioma| GliomaRules[Glioma-Specific Rules]
        TumorType -->|Meningioma| MeningiomaRules[Meningioma Rules]
        TumorType -->|Pituitary| PituitaryRules[Pituitary Rules]
        
        GliomaRules --> Reasoning[Symbolic Reasoning Engine]
        MeningiomaRules --> Reasoning
        PituitaryRules --> Reasoning
        
        Reasoning --> Explanation[Human-Readable Explanation]
        Reasoning --> Treatment[Treatment Protocol]
        Reasoning --> Severity[Severity Assessment]
    end
    
    Explanation --> Output[Final Output]
    Treatment --> Output
    Severity --> Output
    
    Output --> End([Return to User])
    
    style Neural fill:#4f46e5,color:#fff
    style Bridge fill:#f59e0b,color:#fff
    style Symbolic fill:#10b981,color:#fff
```

---

## 3. User Interaction Flowcharts

### 3.1 Doctor Workflow - Patient Analysis

```mermaid
flowchart TD
    Start([Doctor Logs In]) --> Dashboard[View Dashboard]
    Dashboard --> Action{Choose Action}
    
    Action -->|New Patient| CreatePatient[Enter Patient Details]
    Action -->|Existing Patient| SelectPatient[Select from List]
    
    CreatePatient --> PatientForm[Fill Patient Form]
    PatientForm --> SavePatient[Save to Database]
    SavePatient --> UploadMRI
    
    SelectPatient --> PatientView[View Patient Details]
    PatientView --> ViewAction{Select Action}
    
    ViewAction -->|Upload New Scan| UploadMRI[Upload MRI Dialog]
    ViewAction -->|View History| ShowStudies[Display All Studies]
    ViewAction -->|Compare Scans| CompareMode[Enter Compare Mode]
    ViewAction -->|Edit Mask| EditMask[Open Mask Editor]
    ViewAction -->|Generate Report| GeneratePDF[Create PDF Report]
    
    UploadMRI --> SelectFile[Choose MRI File]
    SelectFile --> FileValidation{Valid File?}
    FileValidation -->|No| ErrorMsg[Show Error Message]
    FileValidation -->|Yes| GeneticForm[Enter Genetic Data]
    
    GeneticForm --> IDHInput[IDH Status: Mutant/Wildtype/Unknown]
    GeneticForm --> MGMTInput[MGMT Status: Methylated/Unmethylated/Unknown]
    
    IDHInput --> SubmitUpload[Submit for Analysis]
    MGMTInput --> SubmitUpload
    
    SubmitUpload --> ShowProgress[Display Progress Indicator]
    ShowProgress --> WaitAnalysis[Wait for AI Processing]
    WaitAnalysis --> ResultsReady[Analysis Complete]
    
    ResultsReady --> DisplayResults[Show Results Panel]
    DisplayResults --> ResultComponents[Display Components]
    
    ResultComponents --> ShowImages[MRI, Mask, Grad-CAM]
    ResultComponents --> ShowPrediction[Classification Result]
    ResultComponents --> ShowExplanation[Medical Explanation]
    ResultComponents --> ShowGenomics[Genomic Panel]
    ResultComponents --> ShowTreatment[Treatment Plan]
    
    ShowStudies --> StudyList[List All Studies]
    StudyList --> StudyActions{Study Actions}
    StudyActions -->|View Details| ViewStudy[Show Study Details]
    StudyActions -->|Add Notes| AddNotes[Edit Doctor Notes]
    
    CompareMode --> SelectBase[Select Baseline Scan]
    SelectBase --> SelectFollow[Select Follow-up Scan]
    SelectFollow --> RenderComparison[Render Side-by-Side]
    RenderComparison --> CalculateDiff[Calculate Differences]
    CalculateDiff --> ShowDiffStats[Display Growth/Shrinkage]
    
    EditMask --> LoadCanvas[Load Canvas Editor]
    LoadCanvas --> DrawTools{Select Tool}
    DrawTools -->|Brush| AddRegion[Add to Mask]
    DrawTools -->|Eraser| RemoveRegion[Remove from Mask]
    AddRegion --> SaveMask[Save Modified Mask]
    RemoveRegion --> SaveMask
    SaveMask --> RecalculateFacts[Recalculate Tumor Facts]
    RecalculateFacts --> UpdateStudy[Update Study Record]
    
    GeneratePDF --> PrepareReport[Prepare Report Template]
    PrepareReport --> RenderCharts[Render Progression Charts]
    RenderCharts --> CaptureDOM[Capture DOM as Canvas]
    CaptureDOM --> ConvertPDF[Convert to PDF]
    ConvertPDF --> DownloadPDF[Download PDF File]
    
    ErrorMsg --> UploadMRI
    DownloadPDF --> End([Session Complete])
    UpdateStudy --> End
    ShowDiffStats --> End
    ShowTreatment --> End
    
    style SubmitUpload fill:#4f46e5,color:#fff
    style DisplayResults fill:#10b981,color:#fff
    style GeneratePDF fill:#f59e0b,color:#fff
```

### 3.2 Student Workflow - Learning Journey

```mermaid
flowchart TD
    Start([Student Logs In]) --> LearningLab[Learning Lab Dashboard]
    LearningLab --> SelectModule{Choose Module}
    
    SelectModule -->|Brain Anatomy| AnatomyModule[Brain Anatomy Module]
    SelectModule -->|Tumor Types| TumorModule[Tumor Library]
    SelectModule -->|AI Architecture| AIModule[AI Architecture]
    SelectModule -->|Chatbot| ChatModule[NeuroEdu Bot]
    SelectModule -->|Quiz| QuizModule[Take Quiz]
    
    AnatomyModule --> ViewAnatomy[3D Brain Visualization]
    ViewAnatomy --> ExploreLobes[Explore Brain Lobes]
    ExploreLobes --> LearnFunctions[Learn Functions]
    
    TumorModule --> TumorList[View Tumor Types]
    TumorList --> SelectTumor{Select Tumor}
    SelectTumor -->|Glioma| GliomaInfo[Glioma Details]
    SelectTumor -->|Meningioma| MeningiomaInfo[Meningioma Details]
    SelectTumor -->|Pituitary| PituitaryInfo[Pituitary Details]
    
    GliomaInfo --> ShowOrigin[Origin & Etiology]
    MeningiomaInfo --> ShowOrigin
    PituitaryInfo --> ShowOrigin
    ShowOrigin --> ShowVisualCues[Visual Characteristics]
    ShowVisualCues --> ShowImpact[Clinical Impact]
    
    AIModule --> ViewArchitecture[View Neural Network]
    ViewArchitecture --> Explore3D[3D Network Visualization]
    Explore3D --> LearnLayers[Understand Layers]
    LearnLayers --> LearnActivations[See Activations]
    
    ChatModule --> ChatInterface[Chat Interface]
    ChatInterface --> ChatActions{Chat Action}
    ChatActions -->|Text Message| TypeMessage[Type Question]
    ChatActions -->|Image Upload| UploadImage[Upload MRI Image]
    
    TypeMessage --> SendMessage[Send to Bot]
    UploadImage --> SendMessage
    SendMessage --> ProcessQuery[Process with GPT-4o]
    ProcessQuery --> BotResponse[Receive AI Response]
    BotResponse --> DisplayResponse[Display Answer]
    DisplayResponse --> SpeakOption{Text-to-Speech?}
    SpeakOption -->|Yes| SpeakResponse[Speak Answer]
    SpeakOption -->|No| ChatInterface
    SpeakResponse --> ChatInterface
    
    QuizModule --> LoadQuiz[Load Quiz Questions]
    LoadQuiz --> ShowQuestion[Display Question]
    ShowQuestion --> AnswerOptions[Show Multiple Choices]
    AnswerOptions --> SelectAnswer[Student Selects Answer]
    SelectAnswer --> NextQuestion{More Questions?}
    NextQuestion -->|Yes| ShowQuestion
    NextQuestion -->|No| SubmitQuiz[Submit Quiz]
    
    SubmitQuiz --> CalculateScore[Calculate Score]
    CalculateScore --> ShowResults[Display Results]
    ShowResults --> ShowFeedback[Show Correct Answers]
    ShowFeedback --> SaveProgress[Save to Database]
    
    SaveProgress --> End([Learning Session Complete])
    LearnActivations --> End
    ShowImpact --> End
    LearnFunctions --> End
    
    style ChatModule fill:#10b981,color:#fff
    style QuizModule fill:#f59e0b,color:#fff
    style AIModule fill:#7c3aed,color:#fff
```

---

## 4. Data Processing Flowcharts

### 4.1 DICOM File Processing

```mermaid
flowchart TD
    Start([DICOM File Upload]) --> ReadBytes[Read File Bytes]
    ReadBytes --> ParseDICOM[Parse DICOM with PyDicom]
    
    ParseDICOM --> ValidateDICOM{Valid DICOM?}
    ValidateDICOM -->|No| Error[Return Error]
    ValidateDICOM -->|Yes| ExtractMeta[Extract Metadata]
    
    ExtractMeta --> GetPatientName[Patient Name]
    ExtractMeta --> GetPatientID[Patient ID]
    ExtractMeta --> GetModality[Modality Type]
    ExtractMeta --> GetStudyDate[Study Date]
    
    GetPatientName --> CheckPixelData{Has Pixel Array?}
    GetPatientID --> CheckPixelData
    GetModality --> CheckPixelData
    GetStudyDate --> CheckPixelData
    
    CheckPixelData -->|No| Error
    CheckPixelData -->|Yes| ExtractPixels[Extract Pixel Array]
    
    ExtractPixels --> ConvertFloat[Convert to Float]
    ConvertFloat --> Normalize[Normalize to 0-255]
    Normalize --> ConvertUInt8[Convert to UInt8]
    
    ConvertUInt8 --> CreatePIL[Create PIL Image]
    CreatePIL --> ConvertPNG[Convert to PNG Bytes]
    
    ConvertPNG --> SaveFile[Save as PNG File]
    SaveFile --> UpdateFilename[Update Filename .dcm → .png]
    UpdateFilename --> ReturnData[Return PNG + Metadata]
    
    ReturnData --> ProceedAnalysis[Proceed to AI Analysis]
    Error --> End([Process Failed])
    ProceedAnalysis --> End2([Process Complete])
    
    style ParseDICOM fill:#4f46e5,color:#fff
    style ExtractMeta fill:#10b981,color:#fff
    style ConvertPNG fill:#f59e0b,color:#fff
```

### 4.2 Mask Editing and Fact Recalculation

```mermaid
flowchart TD
    Start([Open Mask Editor]) --> LoadOriginal[Load Original Mask]
    LoadOriginal --> InitCanvas[Initialize Canvas 256x256]
    InitCanvas --> DrawMask[Draw Mask on Canvas]
    
    DrawMask --> WaitAction[Wait for User Action]
    WaitAction --> UserAction{User Action}
    
    UserAction -->|Select Brush| SetBrush[Set Tool: Brush]
    UserAction -->|Select Eraser| SetEraser[Set Tool: Eraser]
    UserAction -->|Adjust Size| ChangeBrushSize[Update Brush Size]
    UserAction -->|Draw| DrawOnCanvas[Draw on Canvas]
    UserAction -->|Save| SaveMask[Save Mask]
    UserAction -->|Cancel| CancelEdit[Cancel Changes]
    
    SetBrush --> WaitAction
    SetEraser --> WaitAction
    ChangeBrushSize --> WaitAction
    DrawOnCanvas --> UpdateCanvas[Update Canvas Display]
    UpdateCanvas --> WaitAction
    
    SaveMask --> ConvertBlob[Convert Canvas to Blob]
    ConvertBlob --> UploadMask[Upload to Server]
    UploadMask --> DecodeMask[Decode Image Bytes]
    DecodeMask --> SaveToFile[Save to File System]
    
    SaveToFile --> RecalculateFacts[Recalculate Tumor Facts]
    RecalculateFacts --> BinarizeMask[Binarize Mask]
    BinarizeMask --> CountPixels[Count Non-Zero Pixels]
    CountPixels --> CalcVolume[Calculate Volume cm²]
    
    BinarizeMask --> FindMoments[Calculate Image Moments]
    FindMoments --> FindCentroid[Find Tumor Centroid]
    FindCentroid --> DetermineLocation[Determine Brain Lobe]
    
    BinarizeMask --> FindContours[Find Contours]
    FindContours --> CalcPerimeter[Calculate Perimeter]
    FindContours --> CalcArea[Calculate Area]
    CalcPerimeter --> CalcCircularity[Calculate Circularity]
    CalcArea --> CalcCircularity
    CalcCircularity --> CalcIrregularity[Irregularity = 1 - Circularity]
    
    CalcVolume --> UpdateFacts[Update AI Facts]
    DetermineLocation --> UpdateFacts
    CalcIrregularity --> UpdateFacts
    
    UpdateFacts --> UpdateDatabase[Update Study in MongoDB]
    UpdateDatabase --> ReturnSuccess[Return Success Message]
    
    CancelEdit --> CloseEditor[Close Editor]
    ReturnSuccess --> CloseEditor
    CloseEditor --> End([Edit Complete])
    
    style RecalculateFacts fill:#4f46e5,color:#fff
    style UpdateDatabase fill:#10b981,color:#fff
```

---

## 5. Authentication & Authorization Flow

### 5.1 Complete Authentication Flow

```mermaid
flowchart TD
    Start([User Opens App]) --> CheckToken{Token in LocalStorage?}
    
    CheckToken -->|No| ShowLogin[Show Login Page]
    CheckToken -->|Yes| ValidateToken[Validate Token with Server]
    
    ValidateToken --> TokenValid{Token Valid?}
    TokenValid -->|No| ClearToken[Clear LocalStorage]
    TokenValid -->|Yes| GetUserInfo[Fetch User Info]
    
    ClearToken --> ShowLogin
    
    ShowLogin --> EnterCreds[Enter Username & Password]
    EnterCreds --> SubmitLogin[Submit Login Form]
    
    SubmitLogin --> CreateFormData[Create URLEncoded FormData]
    CreateFormData --> SendToServer[POST /auth/token]
    
    SendToServer --> ServerValidation{Credentials Valid?}
    ServerValidation -->|No| ShowError[Display Error Message]
    ServerValidation -->|Yes| GenerateJWT[Generate JWT Token]
    
    ShowError --> ShowLogin
    
    GenerateJWT --> ReturnToken[Return access_token]
    ReturnToken --> StoreToken[Store in LocalStorage]
    StoreToken --> FetchUser[GET /auth/users/me]
    
    FetchUser --> GetUserInfo
    GetUserInfo --> ParseRole{User Role?}
    
    ParseRole -->|Doctor| DoctorDashboard[Navigate to Doctor Dashboard]
    ParseRole -->|Student| StudentDashboard[Navigate to Student Learning Lab]
    
    DoctorDashboard --> SetupInterceptor[Setup Axios Interceptor]
    StudentDashboard --> SetupInterceptor
    
    SetupInterceptor --> AddAuthHeader[Add Authorization: Bearer Token]
    AddAuthHeader --> ReadyToUse[Application Ready]
    
    ReadyToUse --> UserAction{User Action}
    UserAction -->|API Request| AttachToken[Attach Token to Request]
    UserAction -->|Logout| Logout[Clear Token & Redirect]
    
    AttachToken --> APICall[Make API Call]
    APICall --> CheckAuth{Token Valid?}
    CheckAuth -->|Yes| ProcessRequest[Process Request]
    CheckAuth -->|No| Return401[Return 401 Unauthorized]
    
    Return401 --> ForceLogout[Force Logout]
    ForceLogout --> ShowLogin
    
    ProcessRequest --> ReturnData[Return Data]
    ReturnData --> UserAction
    
    Logout --> ShowLogin
    
    style GenerateJWT fill:#10b981,color:#fff
    style ValidateToken fill:#4f46e5,color:#fff
    style Return401 fill:#ef4444,color:#fff
```

---

## 6. Multi-Modal Analysis Flow

### 6.1 Visual + Genetic Data Integration

```mermaid
flowchart TD
    Start([Upload MRI + Genetic Data]) --> ReceiveInputs[Receive Inputs]
    
    subgraph VisualPath["Visual Analysis Path"]
        ReceiveInputs --> ProcessImage[Process MRI Image]
        ProcessImage --> RunCNN[CNN Classification]
        RunCNN --> RunSegmentation[U-Net Segmentation]
        RunSegmentation --> ExtractVisual[Extract Visual Facts]
        
        ExtractVisual --> VisualFacts[Visual Facts]
        VisualFacts --> PredClass[Predicted Class]
        VisualFacts --> Confidence[Confidence Score]
        VisualFacts --> Volume[Tumor Volume]
        VisualFacts --> Location[Affected Lobes]
        VisualFacts --> Shape[Shape Irregularity]
    end
    
    subgraph GeneticPath["Genetic Analysis Path"]
        ReceiveInputs --> ParseGenetic[Parse Genetic Data]
        ParseGenetic --> IDHStatus[IDH Mutation Status]
        ParseGenetic --> MGMTStatus[MGMT Methylation Status]
        
        IDHStatus --> GeneticFacts[Genetic Facts]
        MGMTStatus --> GeneticFacts
    end
    
    subgraph Integration["Multi-Modal Integration Layer"]
        PredClass --> Combiner[Fact Combiner]
        Confidence --> Combiner
        Volume --> Combiner
        Location --> Combiner
        Shape --> Combiner
        GeneticFacts --> Combiner
        
        Combiner --> CheckClass{Tumor Type?}
        
        CheckClass -->|Glioma| GliomaLogic[Glioma-Specific Logic]
        CheckClass -->|Other| GeneralLogic[General Logic]
        
        GliomaLogic --> CheckIDH{IDH Status?}
        CheckIDH -->|Mutant| BetterPrognosis[Better Prognosis Context]
        CheckIDH -->|Wildtype| AggressiveCourse[Aggressive Course Context]
        CheckIDH -->|Unknown| NoIDHContext[No IDH Context]
        
        BetterPrognosis --> CheckMGMT{MGMT Status?}
        AggressiveCourse --> CheckMGMT
        NoIDHContext --> CheckMGMT
        
        CheckMGMT -->|Methylated| ChemoResponsive[Chemo-Responsive]
        CheckMGMT -->|Unmethylated| ChemoResistant[Chemo-Resistant]
        CheckMGMT -->|Unknown| NoMGMTContext[No MGMT Context]
        
        ChemoResponsive --> BuildExplanation[Build Rich Explanation]
        ChemoResistant --> BuildExplanation
        NoMGMTContext --> BuildExplanation
        GeneralLogic --> BuildExplanation
    end
    
    subgraph Output["Output Generation"]
        BuildExplanation --> VisualExplanation[Visual Analysis Text]
        BuildExplanation --> GeneticExplanation[Genetic Analysis Text]
        
        VisualExplanation --> CombineText[Combine Explanations]
        GeneticExplanation --> CombineText
        
        CombineText --> GenerateTreatment[Generate Treatment Plan]
        GenerateTreatment --> AdjustSeverity[Adjust Severity Score]
        
        AdjustSeverity --> TreatmentProtocol[Treatment Protocol]
        TreatmentProtocol --> FollowUpPlan[Follow-up Plan]
        FollowUpPlan --> ClinicalAction[Clinical Action]
    end
    
    ClinicalAction --> SaveStudy[Save Complete Study]
    SaveStudy --> DisplayGenomicPanel[Display Genomic Panel in UI]
    DisplayGenomicPanel --> End([Analysis Complete])
    
    style Integration fill:#f59e0b,color:#fff
    style VisualPath fill:#4f46e5,color:#fff
    style GeneticPath fill:#7c3aed,color:#fff
    style Output fill:#10b981,color:#fff
```

### 6.2 Treatment Plan Generation Logic

```mermaid
flowchart TD
    Start([Input: AI Facts + Genetics]) --> InitPlan[Initialize Treatment Plan]
    InitPlan --> BaseSeverity[Base Severity Score = 0]
    
    BaseSeverity --> CheckTumorType{Tumor Type?}
    
    CheckTumorType -->|No Tumor| NoTumorPlan[Severity: 0]
    NoTumorPlan --> ActionClear[Action: Clear]
    ActionClear --> FollowUpRoutine[Follow-up: As Needed]
    FollowUpRoutine --> ProtocolDischarge[Protocol: Discharge]
    
    CheckTumorType -->|Glioma| GliomaPlan[Base Severity: 75]
    GliomaPlan --> CheckGliomaIDH{IDH Status?}
    CheckGliomaIDH -->|Wildtype| AddSeverity[Add 15 to Severity]
    CheckGliomaIDH -->|Mutant| KeepBase[Keep Base Severity]
    CheckGliomaIDH -->|Unknown| KeepBase
    
    AddSeverity --> AggressiveAction[Action: Aggressive Resection + Radiation]
    KeepBase --> StandardAction[Action: Surgical Resection]
    
    AggressiveAction --> GliomaFollowUp[Follow-up: MRI every 2-3 months]
    StandardAction --> GliomaFollowUp2[Follow-up: MRI every 3-6 months]
    
    GliomaFollowUp --> GliomaProtocol[Protocol: Maximal Safe Resection, Radiotherapy]
    GliomaFollowUp2 --> GliomaProtocol
    
    CheckTumorType -->|Meningioma| MeningiomaPlan[Check Volume]
    MeningiomaPlan --> CheckMeningiomaVol{Volume < 3 cm²?}
    CheckMeningiomaVol -->|Yes| SmallMeningioma[Severity: 40]
    CheckMeningiomaVol -->|No| LargeMeningioma[Severity: 65]
    
    SmallMeningioma --> SurveillanceAction[Action: Active Surveillance]
    SurveillanceAction --> SurveillanceFollowUp[Follow-up: MRI in 6-12 months]
    SurveillanceFollowUp --> SurveillanceProtocol[Protocol: Monitor Growth]
    
    LargeMeningioma --> SurgeryAction[Action: Surgery]
    SurgeryAction --> SurgeryFollowUp[Follow-up: Post-op MRI in 3 months]
    SurgeryFollowUp --> SurgeryProtocol[Protocol: Surgical Resection]
    
    CheckTumorType -->|Pituitary| PituitaryPlan[Check Volume]
    PituitaryPlan --> CheckPituitaryVol{Volume < 1 cm²?}
    CheckPituitaryVol -->|Yes| Microadenoma[Severity: 30]
    CheckPituitaryVol -->|No| Macroadenoma[Severity: 60]
    
    Microadenoma --> EndocrineAction[Action: Endocrine Evaluation]
    EndocrineAction --> EndocrineFollowUp[Follow-up: MRI + Labs in 6-12 months]
    EndocrineFollowUp --> EndocrineProtocol[Protocol: Hormone Testing]
    
    Macroadenoma --> OphthalmologyAction[Action: Ophthalmology + Endocrine Consult]
    OphthalmologyAction --> OphthalmologyFollowUp[Follow-up: MRI in 3 months, Visual Fields]
    OphthalmologyFollowUp --> OphthalmologyProtocol[Protocol: Hormone Testing, Visual Assessment]
    
    ProtocolDischarge --> FormatOutput[Format Treatment Plan Object]
    GliomaProtocol --> FormatOutput
    SurveillanceProtocol --> FormatOutput
    SurgeryProtocol --> FormatOutput
    EndocrineProtocol --> FormatOutput
    OphthalmologyProtocol --> FormatOutput
    
    FormatOutput --> ReturnPlan[Return Treatment Plan]
    ReturnPlan --> End([Complete])
    
    style GliomaPlan fill:#ef4444,color:#fff
    style MeningiomaPlan fill:#f59e0b,color:#fff
    style PituitaryPlan fill:#10b981,color:#fff
    style FormatOutput fill:#4f46e5,color:#fff
```

---

## 📚 Related Documentation

- [Architecture Documentation](./ARCHITECTURE_DOCUMENTATION.md) - System architecture diagrams
- [Component Diagram](./COMPONENT_DIAGRAM.md) - Detailed component relationships
- [README](./README.md) - Project overview and setup

---

*Generated for AI Visualizer Project - Neurosymbolic Brain Tumor Diagnosis System*
