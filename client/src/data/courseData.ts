// ─────────────────────────────────────────────────────────────────────────────
// Jua Kali Clinical Intelligence Hub — Course Data
// All courses and modules for TechSkills Campus, OncoAI, and Clinical Skills
// ─────────────────────────────────────────────────────────────────────────────

export interface Module {
  id: number;
  index: number;
  title: string;
  description: string;
  type: "video" | "reading" | "quiz" | "simulation" | "lab" | "assessment";
  durationMinutes: number;
  cpdPoints: number;
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: "techskills" | "oncoai" | "clinical";
  subcategory: string;
  totalModules: number;
  cpdPoints: number;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  estimatedHours: number;
  icon: string;
  color: string;
  modules: Module[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function makeModules(courseId: number, titles: string[]): Module[] {
  const types: Module["type"][] = ["video", "reading", "quiz", "simulation", "lab", "assessment"];
  return titles.map((title, i) => ({
    id: courseId * 1000 + i + 1,
    index: i + 1,
    title,
    description: `In-depth coverage of ${title}. Includes practical exercises and knowledge checks.`,
    type: types[i % types.length],
    durationMinutes: 25 + (i % 5) * 10,
    cpdPoints: i % 5 === 4 ? 2 : 1,
  }));
}

// ─── TECHSKILLS CAMPUS ────────────────────────────────────────────────────────

const healthInformaticsModules = makeModules(1, [
  "Introduction to Health Informatics", "EHR Architecture & Standards", "HL7 FHIR Fundamentals",
  "ICD-10 & SNOMED CT Coding Systems", "Clinical Decision Support Systems", "Interoperability & Data Exchange",
  "Patient Data Privacy (HIPAA/GDPR)", "EHR Workflow Optimization", "Clinical Documentation Best Practices",
  "Laboratory Information Systems", "Radiology Information Systems (RIS)", "Pharmacy Information Systems",
  "Nursing Informatics Essentials", "Population Health Management", "Public Health Surveillance Systems",
  "Health Data Governance Frameworks", "Data Quality & Integrity Assurance", "Master Patient Index (MPI)",
  "Clinical Terminology Standards", "Health IT Project Management", "Change Management in Healthcare IT",
  "User Training & Adoption Strategies", "Telemedicine Integration Protocols", "Mobile Health Applications",
  "Cloud Computing in Healthcare", "Big Data in Clinical Settings", "NLP in Electronic Health Records",
  "Voice Recognition Systems in EHR", "Barcode & RFID in Healthcare", "Supply Chain Management Systems",
  "Revenue Cycle Management", "Healthcare Analytics Dashboards", "Predictive Analytics in EHR",
  "Patient Portal Implementation", "Remote Patient Monitoring Integration", "Disaster Recovery & Business Continuity",
  "Regulatory Compliance & Auditing", "Health IT Security Frameworks", "Emerging Technologies in Informatics",
  "Capstone: EHR System Design Project"
]);

const clinicalDataScienceModules = makeModules(2, [
  "Foundations of Clinical Data Science", "Python for Healthcare Data Analysis", "R Programming for Biomedical Research",
  "SQL Databases in Clinical Environments", "Data Cleaning & Preprocessing for Clinical Data", "Exploratory Data Analysis in Medicine",
  "Statistical Inference for Clinical Trials", "Survival Analysis & Time-to-Event Data", "Regression Models in Clinical Research",
  "Machine Learning Fundamentals for Clinicians", "Supervised Learning: Classification in Diagnostics", "Unsupervised Learning: Patient Clustering",
  "Deep Learning for Medical Image Analysis", "Natural Language Processing for Clinical Notes", "Feature Engineering for EHR Data",
  "Model Validation & Cross-Validation Techniques", "Handling Imbalanced Clinical Datasets", "Bias & Fairness in Clinical AI",
  "Explainable AI (XAI) in Healthcare", "Clinical Trial Data Management", "Real-World Evidence (RWE) Studies",
  "Pharmacovigilance Data Analytics", "Genomics Data Analysis Pipelines", "Proteomics & Metabolomics Data",
  "Electronic Phenotyping Algorithms", "Predictive Modeling for Readmission Risk", "Sepsis Early Warning Systems",
  "Chronic Disease Progression Modeling", "Mental Health Data Analytics", "Oncology Data Science Applications",
  "Imaging Biomarker Extraction", "Wearable Sensor Data Analysis", "Social Determinants of Health Analytics",
  "Health Equity Data Analysis", "Dashboard Development with Power BI/Tableau", "Data Storytelling for Clinical Audiences",
  "Ethical Considerations in Clinical Data Science", "Regulatory Pathways for AI/ML Devices (FDA/CE)", "Publishing Clinical Data Science Research",
  "Capstone: End-to-End Clinical ML Pipeline"
]);

const aiDiagnosticsModules = makeModules(3, [
  "Introduction to AI in Clinical Diagnostics", "History & Evolution of Medical AI", "Neural Networks for Medical Imaging",
  "Convolutional Neural Networks (CNNs) in Radiology", "Transformer Models in Medical AI", "AI for Chest X-Ray Interpretation",
  "AI-Assisted ECG Analysis", "Dermatology AI: Skin Lesion Classification", "Ophthalmology AI: Retinal Imaging",
  "Pathology AI: Digital Slide Analysis", "AI in Endoscopy & Colonoscopy", "Cardiology AI: Echo & Cardiac MRI",
  "Neurology AI: Brain MRI Segmentation", "AI for Sepsis Prediction in ICU", "AI-Driven Drug Discovery Overview",
  "Clinical Decision Support System Design", "Alert Fatigue & CDSS Optimization", "Federated Learning in Healthcare",
  "Transfer Learning for Medical Applications", "Model Interpretability: SHAP & LIME", "Prospective Validation of AI Diagnostics",
  "Regulatory Approval of AI Diagnostics (FDA 510k)", "CE Marking for AI Medical Devices", "Workflow Integration of AI Tools",
  "Clinician-AI Collaboration Models", "Bias Detection in Diagnostic AI", "Adversarial Attacks on Medical AI",
  "Privacy-Preserving AI in Diagnostics", "AI in Point-of-Care Testing", "AI for Rare Disease Diagnosis",
  "Multi-Modal AI: Combining Imaging & EHR", "AI in Emergency Medicine Triage", "Pediatric AI Diagnostics",
  "Geriatric AI Assessment Tools", "AI for Mental Health Screening", "Oncology AI: Tumor Detection & Staging",
  "AI in Infectious Disease Surveillance", "Global Health AI Applications", "Emerging Frontiers in Diagnostic AI",
  "Capstone: Build & Validate a Diagnostic AI Model"
]);

const telemedicineModules = makeModules(4, [
  "Introduction to Telemedicine & Telehealth", "Regulatory Frameworks for Telemedicine", "Telemedicine Platform Architecture",
  "Video Consultation Best Practices", "Remote Physical Examination Techniques", "Digital Stethoscopes & Remote Auscultation",
  "Teledermatology: Image Capture & Transmission", "Telepsychiatry: Mental Health via Video", "Telestroke Protocols",
  "Telecardiology: Remote ECG Monitoring", "Tele-ICU: Remote Critical Care", "Teleophthalmology Services",
  "Telerehabilitation Programs", "Chronic Disease Management via Telehealth", "Pediatric Telemedicine",
  "Geriatric Telehealth Services", "Rural & Low-Resource Telemedicine", "Mobile Health (mHealth) Applications",
  "SMS-Based Health Interventions", "AI Chatbots in Patient Triage", "Remote Patient Monitoring (RPM) Systems",
  "Wearable Integration with Telehealth Platforms", "IoT Devices in Home Healthcare", "Digital Therapeutics (DTx)",
  "Patient Engagement & Digital Literacy", "Telemedicine Billing & Reimbursement", "Data Security in Telehealth",
  "Interoperability: Telehealth & EHR Integration", "Quality Metrics for Telehealth Programs", "Patient Satisfaction in Telemedicine",
  "Telehealth for Underserved Populations", "Cross-Border Telemedicine Regulations", "Telemedicine in Disaster Response",
  "School-Based Telehealth Programs", "Occupational Health Teleservices", "Pharmacy Telepharmacy Services",
  "Telemedicine Program Implementation", "Staff Training for Telehealth", "Evaluating Telehealth Outcomes",
  "Capstone: Design a Telehealth Program"
]);

const medicalImagingModules = makeModules(5, [
  "Physics of Medical Imaging", "X-Ray Imaging Fundamentals", "Computed Tomography (CT) Principles",
  "Magnetic Resonance Imaging (MRI) Basics", "Ultrasound Physics & Applications", "Nuclear Medicine: PET & SPECT",
  "Fluoroscopy & Interventional Radiology", "Mammography & Breast Imaging", "Bone Densitometry (DEXA)",
  "Dental Radiology & CBCT", "Image Acquisition & Quality Control", "Digital Imaging & PACS Systems",
  "DICOM Standards & Imaging Informatics", "Image Processing & Enhancement", "3D Reconstruction & Visualization",
  "Radiation Safety & Dosimetry", "Contrast Agents & Safety Protocols", "Pediatric Imaging Considerations",
  "Obstetric & Gynecological Imaging", "Cardiac Imaging Techniques", "Neuroimaging: Brain & Spine",
  "Musculoskeletal Radiology", "Abdominal & Pelvic Imaging", "Chest Imaging & Pulmonary Radiology",
  "Vascular Imaging & Angiography", "Interventional Radiology Procedures", "Image-Guided Biopsy Techniques",
  "Radiological Reporting Standards", "Structured Reporting & AI Integration", "Teleradiology Services",
  "Radiation Therapy Planning Imaging", "Functional MRI (fMRI) Applications", "Diffusion Tensor Imaging (DTI)",
  "Spectroscopy in MRI", "Hybrid Imaging: PET-CT & PET-MRI", "Photoacoustic Imaging Emerging Tech",
  "Artificial Intelligence in Medical Imaging", "Radiomics & Quantitative Imaging", "Global Radiology & Low-Resource Settings",
  "Capstone: Comprehensive Imaging Case Studies"
]);

const cybersecurityModules = makeModules(6, [
  "Introduction to Healthcare Cybersecurity", "Threat Landscape in Healthcare", "HIPAA Security Rule Requirements",
  "GDPR for Healthcare Organizations", "Risk Assessment Frameworks (NIST, ISO 27001)", "Network Security in Hospital Environments",
  "Endpoint Security for Medical Devices", "Medical Device Cybersecurity (FDA Guidance)", "IoMT Security Challenges",
  "Cloud Security for Healthcare Data", "Identity & Access Management (IAM)", "Multi-Factor Authentication in Healthcare",
  "Encryption Standards for Health Data", "Secure Email & Communication", "Phishing & Social Engineering Defense",
  "Ransomware Prevention & Response", "Incident Response Planning", "Business Continuity & Disaster Recovery",
  "Vulnerability Assessment & Penetration Testing", "Security Information & Event Management (SIEM)", "Threat Intelligence in Healthcare",
  "Zero Trust Architecture in Hospitals", "Secure Software Development Lifecycle (SSDLC)", "API Security for Health Platforms",
  "Third-Party Vendor Risk Management", "Supply Chain Security", "Insider Threat Detection",
  "Digital Forensics in Healthcare", "Legal & Regulatory Compliance Auditing", "Security Awareness Training Programs",
  "Cybersecurity Governance Frameworks", "Board-Level Cybersecurity Reporting", "Cyber Insurance for Healthcare",
  "Emerging Threats: AI-Powered Attacks", "Blockchain for Health Data Security", "Quantum Computing Threats to Healthcare",
  "International Cybersecurity Standards", "Cybersecurity in Low-Resource Settings", "Building a Healthcare SOC",
  "Capstone: Healthcare Cybersecurity Audit"
]);

const iotWearablesModules = makeModules(7, [
  "Introduction to IoT in Medicine", "Wearable Sensor Technologies", "Continuous Glucose Monitoring (CGM) Systems",
  "Smartwatch Health Monitoring", "ECG Wearables & Cardiac Monitoring", "Blood Pressure Wearables",
  "Pulse Oximetry & SpO2 Monitoring", "Sleep Tracking Technologies", "Activity & Fall Detection Sensors",
  "Implantable Medical Devices & IoT", "Smart Inhalers & Respiratory Monitoring", "Neurological Wearables & EEG Headsets",
  "Rehabilitation Wearables & Exoskeletons", "Remote Patient Monitoring Platforms", "IoT Data Transmission Protocols (BLE, Zigbee, LoRa)",
  "Edge Computing for Medical IoT", "IoT Data Security & Privacy", "Interoperability: IoT to EHR Integration",
  "Regulatory Approval of Wearable Devices", "Clinical Validation of Wearable Data", "Wearable Data Analytics",
  "Machine Learning on Wearable Streams", "Predictive Alerts from Wearable Data", "Chronic Disease Management with Wearables",
  "Cardiac Arrhythmia Detection via Wearables", "Diabetes Management IoT Ecosystem", "Oncology Patient Monitoring at Home",
  "Pediatric Wearable Monitoring", "Geriatric IoT Health Solutions", "Mental Health Wearables",
  "Sports Medicine & Performance Wearables", "Occupational Health IoT Applications", "Smart Hospital Infrastructure",
  "Connected Operating Rooms", "IoT in Emergency Medical Services", "Environmental Monitoring in Healthcare",
  "Supply Chain IoT in Hospitals", "5G & Next-Gen Connectivity for Medical IoT", "Ethical Considerations in Health IoT",
  "Capstone: Design an IoT Health Monitoring System"
]);

const blockchainModules = makeModules(8, [
  "Introduction to Blockchain Technology", "Distributed Ledger Fundamentals", "Cryptographic Principles in Blockchain",
  "Smart Contracts & Solidity Basics", "Ethereum for Healthcare Applications", "Hyperledger Fabric in Healthcare",
  "Blockchain for Electronic Health Records", "Patient Data Ownership & Consent Management", "Decentralized Identity (DID) in Healthcare",
  "Interoperability via Blockchain", "Drug Supply Chain Traceability", "Medical Device Tracking on Blockchain",
  "Clinical Trial Data Integrity", "Research Data Sharing on Blockchain", "Insurance Claims Processing",
  "Blockchain-Based Credentialing", "Health Information Exchange (HIE) on Blockchain", "FHIR + Blockchain Integration",
  "Privacy-Preserving Blockchain (Zero-Knowledge Proofs)", "Tokenization of Health Data", "Blockchain in Genomics",
  "NFTs for Medical Records (Concepts)", "Governance Models for Health Blockchains", "Regulatory Considerations for Health Blockchain",
  "Scalability Challenges in Healthcare Blockchain", "Energy Efficiency in Blockchain Systems", "Consortium Blockchain Networks",
  "Case Study: MedRec System", "Case Study: Gem Health Network", "Case Study: Hashed Health",
  "Blockchain for Global Health", "Low-Resource Setting Blockchain Applications", "Blockchain & AI Integration",
  "Blockchain for Pandemic Response", "Cybersecurity of Blockchain Systems", "Legal Frameworks for Health Blockchain",
  "Economic Models for Health Data Markets", "Future of Blockchain in Medicine", "Barriers to Blockchain Adoption",
  "Capstone: Design a Blockchain Health Solution"
]);

// ─── ONCOAI COURSEWORK (20 modules) ──────────────────────────────────────────

const oncoaiModules = makeModules(9, [
  "Introduction to OncoAI Platform & Architecture", "Radiology Fundamentals for Oncology Practice",
  "CT Scan Interpretation in Cancer Staging", "MRI in Neuro-Oncology: Protocols & Findings",
  "PET-CT Fusion Imaging for Oncology", "Ultrasound in Oncological Assessment",
  "AI-Assisted Tumor Detection Algorithms", "Radiomics & Quantitative Feature Extraction",
  "Deep Learning Models for Radiology (CNNs, ViTs)", "Tumor Staging & TNM Classification",
  "Lung Cancer Imaging Protocols & AI Analysis", "Brain Tumor MRI Analysis & Segmentation",
  "Breast Cancer Imaging: Mammography & MRI", "Colorectal Cancer Radiology & Staging",
  "Lymphoma Imaging Patterns & Response Assessment", "Radiation Therapy Planning with AI",
  "Treatment Response Evaluation (RECIST 1.1)", "Neuro-Oncology Imaging Biomarkers",
  "Integrated Oncology Reporting Standards", "OncoAI Platform Capstone Assessment & CPD Certification"
]);

// ─── COURSE DEFINITIONS ───────────────────────────────────────────────────────

export const TECHSKILLS_COURSES: Course[] = [
  {
    id: 1, slug: "health-informatics", title: "Health Informatics & EHR Systems",
    description: "Master electronic health record systems, HL7 FHIR, interoperability standards, and clinical informatics workflows used across modern healthcare institutions.",
    category: "techskills", subcategory: "informatics", totalModules: 40, cpdPoints: 20,
    difficulty: "intermediate", estimatedHours: 60, icon: "Database", color: "cyan",
    modules: healthInformaticsModules,
  },
  {
    id: 2, slug: "clinical-data-science", title: "Clinical Data Science & Analytics",
    description: "Apply Python, R, machine learning, and statistical methods to clinical datasets, enabling evidence-based decision-making and predictive healthcare analytics.",
    category: "techskills", subcategory: "data-science", totalModules: 40, cpdPoints: 20,
    difficulty: "advanced", estimatedHours: 60, icon: "BarChart3", color: "blue",
    modules: clinicalDataScienceModules,
  },
  {
    id: 3, slug: "ai-diagnostics", title: "AI-Powered Diagnostics & Decision Support",
    description: "Explore deep learning, neural networks, and clinical decision support systems transforming diagnostic accuracy across radiology, pathology, and cardiology.",
    category: "techskills", subcategory: "ai", totalModules: 40, cpdPoints: 20,
    difficulty: "advanced", estimatedHours: 60, icon: "Brain", color: "purple",
    modules: aiDiagnosticsModules,
  },
  {
    id: 4, slug: "telemedicine-digital-health", title: "Telemedicine & Digital Health Platforms",
    description: "Design, implement, and evaluate telemedicine programs, mHealth applications, and remote patient monitoring systems for diverse clinical environments.",
    category: "techskills", subcategory: "telemedicine", totalModules: 40, cpdPoints: 20,
    difficulty: "intermediate", estimatedHours: 60, icon: "Video", color: "green",
    modules: telemedicineModules,
  },
  {
    id: 5, slug: "medical-imaging-tech", title: "Medical Imaging Technology",
    description: "Comprehensive coverage of imaging modalities (X-ray, CT, MRI, PET, Ultrasound), PACS/DICOM systems, radiation safety, and AI-assisted image interpretation.",
    category: "techskills", subcategory: "imaging", totalModules: 40, cpdPoints: 20,
    difficulty: "advanced", estimatedHours: 60, icon: "Scan", color: "orange",
    modules: medicalImagingModules,
  },
  {
    id: 6, slug: "cybersecurity-healthcare", title: "Cybersecurity in Healthcare",
    description: "Protect healthcare systems from ransomware, data breaches, and insider threats. Covers HIPAA, GDPR, NIST frameworks, medical device security, and incident response.",
    category: "techskills", subcategory: "security", totalModules: 40, cpdPoints: 20,
    difficulty: "intermediate", estimatedHours: 60, icon: "Shield", color: "red",
    modules: cybersecurityModules,
  },
  {
    id: 7, slug: "iot-wearables-medicine", title: "IoT & Wearables in Medicine",
    description: "Understand connected health devices, wearable sensors, remote monitoring platforms, and IoT data analytics for chronic disease management and hospital operations.",
    category: "techskills", subcategory: "iot", totalModules: 40, cpdPoints: 20,
    difficulty: "intermediate", estimatedHours: 60, icon: "Wifi", color: "teal",
    modules: iotWearablesModules,
  },
  {
    id: 8, slug: "blockchain-health-records", title: "Blockchain for Health Records",
    description: "Explore distributed ledger technology, smart contracts, patient data ownership, drug supply chain integrity, and decentralized health information exchange.",
    category: "techskills", subcategory: "blockchain", totalModules: 40, cpdPoints: 20,
    difficulty: "advanced", estimatedHours: 60, icon: "Link", color: "indigo",
    modules: blockchainModules,
  },
];

// ─── ONCOAI COURSES ───────────────────────────────────────────────────────────

export const ONCOAI_COURSES: Course[] = [
  {
    id: 9, slug: "oncoai-radiology-coursework", title: "OncoAI Radiology & Oncology Coursework",
    description: "Structured 20-module coursework integrating OncoAI platform skills with radiology interpretation, AI-assisted tumor detection, treatment planning, and oncology reporting. Includes CPD certification.",
    category: "oncoai", subcategory: "radiology", totalModules: 20, cpdPoints: 15,
    difficulty: "expert", estimatedHours: 40, icon: "Radiation", color: "pink",
    modules: oncoaiModules,
  },
];

// ─── CLINICAL SKILLS COURSES ──────────────────────────────────────────────────

const insulinModules = makeModules(10, [
  "Anatomy & Physiology of the Pancreas", "Pathophysiology of Diabetes Mellitus", "Types of Insulin: Rapid, Short, Intermediate, Long-Acting",
  "Insulin Pharmacokinetics & Pharmacodynamics", "Insulin Storage & Handling", "Insulin Injection Technique & Sites",
  "Insulin Pen Devices & Cartridges", "Insulin Pump Therapy (CSII) Basics", "Continuous Glucose Monitoring (CGM) Integration",
  "Basal-Bolus Insulin Regimens", "Sliding Scale Insulin Protocols", "Carbohydrate Counting & Insulin-to-Carb Ratios",
  "Correction Factor & Insulin Sensitivity", "Hypoglycemia: Recognition & Management", "Hyperglycemia & Diabetic Ketoacidosis (DKA)",
  "Hyperosmolar Hyperglycemic State (HHS)", "Insulin Therapy in Type 1 Diabetes", "Insulin Therapy in Type 2 Diabetes",
  "Insulin in Gestational Diabetes", "Insulin in Hospitalized Patients", "Perioperative Insulin Management",
  "Insulin in Renal & Hepatic Impairment", "Insulin in Pediatric Patients", "Insulin in Elderly Patients",
  "Patient Education: Insulin Self-Management", "Motivational Interviewing for Diabetes Care", "Insulin Adherence & Barriers",
  "Insulin Errors: Prevention & Reporting", "Insulin Waste & Disposal", "Biosimilar Insulins",
  "Emerging Insulin Technologies", "Closed-Loop Systems (Artificial Pancreas)", "Insulin & Comorbidities",
  "Insulin Therapy Monitoring & HbA1c Targets", "Diabetes Complications & Insulin Role", "Insulin in Emergency Settings",
  "Insulin Documentation & Legal Aspects", "Interprofessional Insulin Management", "Quality Improvement in Insulin Therapy",
  "Capstone: Insulin Certification Assessment"
]);

const cnaModules = makeModules(11, [
  "Role & Responsibilities of the CNA", "Healthcare Team Communication", "Patient Rights & Dignity",
  "Infection Control & Standard Precautions", "Hand Hygiene Techniques", "Personal Protective Equipment (PPE)",
  "Body Mechanics & Safe Patient Handling", "Bed Making & Linen Management", "Bathing & Personal Hygiene Assistance",
  "Oral Care & Denture Management", "Grooming: Hair, Nail & Skin Care", "Dressing & Undressing Assistance",
  "Ambulation & Transfer Techniques", "Wheelchair & Mobility Aid Use", "Positioning & Pressure Ulcer Prevention",
  "Vital Signs: Temperature, Pulse, Respiration", "Blood Pressure Measurement", "Pulse Oximetry & SpO2 Monitoring",
  "Intake & Output Measurement", "Nutrition Assistance & Feeding", "Fluid Balance & Hydration",
  "Catheter Care & Urinary Drainage", "Bowel Care & Ostomy Management", "Specimen Collection Basics",
  "Wound Care Basics & Dressing Changes", "Oxygen Therapy Assistance", "Restraint Use & Alternatives",
  "Fall Prevention Protocols", "Emergency Response: CPR & First Aid", "Mental Health & Dementia Care",
  "End-of-Life Care & Comfort Measures", "Pain Assessment & Non-Pharmacological Relief", "Documentation & Reporting",
  "Electronic Health Records for CNAs", "Geriatric Care Principles", "Pediatric Care Considerations",
  "Cultural Competency in Nursing Care", "Legal & Ethical Issues for CNAs", "CNA Scope of Practice & Boundaries",
  "Capstone: CNA Competency Assessment"
]);

const emtModules = makeModules(12, [
  "Introduction to Emergency Medical Services (EMS)", "EMS System Structure & Roles", "Medical-Legal Aspects of EMS",
  "EMS Communications & Dispatch", "Scene Safety & Situational Awareness", "Patient Assessment: Primary Survey",
  "Patient Assessment: Secondary Survey", "Vital Signs & Patient Monitoring", "Airway Management Fundamentals",
  "Oxygen Therapy & Ventilation", "Bag-Valve-Mask (BVM) Technique", "Suction & Airway Clearance",
  "Shock Recognition & Management", "Hemorrhage Control & Wound Care", "Splinting & Fracture Management",
  "Spinal Motion Restriction", "Burn Assessment & Management", "Cardiac Emergencies & AED Use",
  "CPR: Adult, Child & Infant", "Stroke Recognition (FAST Protocol)", "Diabetic Emergencies",
  "Allergic Reactions & Anaphylaxis", "Respiratory Emergencies: Asthma, COPD", "Seizure Management",
  "Altered Mental Status Assessment", "Toxicology & Poisoning Emergencies", "Behavioral & Psychiatric Emergencies",
  "Obstetric Emergencies & Childbirth", "Pediatric Emergencies", "Geriatric Emergencies",
  "Trauma Assessment & Mechanism of Injury", "Head & Brain Injuries", "Chest Trauma Management",
  "Abdominal Trauma", "Musculoskeletal Trauma", "Environmental Emergencies: Heat, Cold, Drowning",
  "Mass Casualty Incidents & Triage (START)", "Hazardous Materials (HazMat) Awareness", "Vehicle Extrication Basics",
  "Capstone: EMT Skills Practical Assessment"
]);

const clinicalSkillsModules = makeModules(13, [
  "Clinical Communication & History Taking", "Physical Examination: General Inspection", "Head & Neck Examination",
  "Cardiovascular Examination", "Respiratory Examination", "Abdominal Examination",
  "Neurological Examination", "Musculoskeletal Examination", "Dermatological Assessment",
  "Ophthalmological Examination Basics", "Ear, Nose & Throat (ENT) Examination", "Breast Examination",
  "Male Genitourinary Examination", "Female Pelvic Examination", "Rectal Examination",
  "Venepuncture & Phlebotomy", "Intravenous Cannulation", "Arterial Blood Gas (ABG) Sampling",
  "Urinary Catheterization", "Nasogastric Tube Insertion", "Wound Assessment & Suturing",
  "Lumbar Puncture Procedure", "Pleural Aspiration (Thoracocentesis)", "Ascitic Tap (Paracentesis)",
  "Joint Aspiration & Injection", "ECG Recording & Interpretation", "Spirometry & Lung Function Tests",
  "Peak Flow Measurement", "Blood Glucose Monitoring", "Urine Dipstick Analysis",
  "Interpretation of Blood Tests (FBC, U&E, LFTs)", "Chest X-Ray Interpretation", "Prescribing Safely",
  "Medication Administration Routes", "Infection Control in Clinical Practice", "Sterile Technique & Asepsis",
  "Clinical Handover (SBAR)", "Documentation & Medical Records", "Ethical Dilemmas in Clinical Practice",
  "Capstone: OSCE Clinical Skills Assessment"
]);

const biostatisticsModules = makeModules(14, [
  "Introduction to Biostatistics", "Types of Data & Measurement Scales", "Descriptive Statistics",
  "Probability Theory Fundamentals", "Normal Distribution & Z-Scores", "Sampling Methods & Bias",
  "Hypothesis Testing Framework", "Type I & Type II Errors", "P-Values & Statistical Significance",
  "Confidence Intervals", "t-Tests: One-Sample, Independent, Paired", "Analysis of Variance (ANOVA)",
  "Chi-Square Tests", "Fisher's Exact Test", "Correlation Analysis (Pearson, Spearman)",
  "Simple Linear Regression", "Multiple Linear Regression", "Logistic Regression in Clinical Research",
  "Survival Analysis: Kaplan-Meier Curves", "Cox Proportional Hazards Model", "Non-Parametric Tests",
  "Sample Size Calculation & Power Analysis", "Randomized Controlled Trial (RCT) Design", "Cohort Study Design",
  "Case-Control Study Design", "Cross-Sectional Study Design", "Systematic Reviews & Meta-Analysis",
  "Forest Plots & Heterogeneity", "Funnel Plots & Publication Bias", "Diagnostic Test Accuracy (Sensitivity, Specificity)",
  "ROC Curves & AUC", "Number Needed to Treat (NNT)", "Intention-to-Treat Analysis",
  "Missing Data Handling", "Confounding & Effect Modification", "Propensity Score Methods",
  "Bayesian Statistics Introduction", "Research Ethics & Informed Consent", "Scientific Writing & Publication",
  "Capstone: Research Protocol Development"
]);

const humanHealthModules = makeModules(15, [
  "Introduction to Human Anatomy", "Cell Biology & Physiology", "Genetics & Heredity Basics",
  "Musculoskeletal System", "Cardiovascular System Anatomy & Function", "Respiratory System",
  "Digestive System & Nutrition", "Urinary System & Fluid Balance", "Nervous System Overview",
  "Endocrine System & Hormones", "Immune System & Defense Mechanisms", "Reproductive System",
  "Integumentary System (Skin)", "Sensory Systems: Vision, Hearing, Taste, Smell", "Blood & Hematopoiesis",
  "Homeostasis & Feedback Mechanisms", "Metabolism & Energy Balance", "Nutrition Science Fundamentals",
  "Vitamins, Minerals & Micronutrients", "Hydration & Electrolyte Balance", "Exercise Physiology",
  "Aging & Gerontology Basics", "Growth & Development Across the Lifespan", "Mental Health Foundations",
  "Stress Response & Adaptation", "Sleep Physiology & Health", "Pain Physiology",
  "Inflammation & Wound Healing", "Infectious Disease Basics", "Non-Communicable Diseases Overview",
  "Environmental Health Hazards", "Occupational Health Principles", "Epidemiology of Common Diseases",
  "Health Promotion & Disease Prevention", "Screening & Early Detection", "Vaccination & Immunization",
  "Global Health Challenges", "Social Determinants of Health", "Health Literacy & Patient Education",
  "Capstone: Human Health Assessment"
]);

const pharmacologyModules = makeModules(16, [
  "Introduction to Pharmacology", "Pharmacokinetics: Absorption", "Pharmacokinetics: Distribution",
  "Pharmacokinetics: Metabolism (Biotransformation)", "Pharmacokinetics: Excretion", "Pharmacodynamics: Drug-Receptor Interactions",
  "Dose-Response Relationships", "Drug Toxicity & Adverse Effects", "Drug Interactions",
  "Autonomic Nervous System Pharmacology", "Cardiovascular Drugs: Antihypertensives", "Cardiovascular Drugs: Antiarrhythmics",
  "Cardiovascular Drugs: Heart Failure Medications", "Anticoagulants & Antiplatelets", "Respiratory Pharmacology",
  "Gastrointestinal Pharmacology", "Endocrine Pharmacology: Diabetes Drugs", "Endocrine Pharmacology: Thyroid & Steroids",
  "Renal Pharmacology & Diuretics", "Central Nervous System: Analgesics & Opioids", "CNS: Antidepressants & Anxiolytics",
  "CNS: Antipsychotics & Mood Stabilizers", "CNS: Antiepileptics", "Antimicrobial Agents: Antibiotics",
  "Antimicrobial Agents: Antivirals", "Antimicrobial Agents: Antifungals & Antiparasitics", "Chemotherapy & Targeted Cancer Therapy",
  "Immunosuppressants & Biologics", "Analgesics: NSAIDs & Paracetamol", "Local & General Anaesthetics",
  "Paediatric Pharmacology", "Geriatric Pharmacology & Polypharmacy", "Drug Use in Pregnancy & Lactation",
  "Herbal Medicine & Drug Interactions", "Pharmacogenomics", "Drug Regulation & Approval Process",
  "Medication Errors & Patient Safety", "Pharmacovigilance & Post-Marketing Surveillance", "Rational Drug Prescribing",
  "Capstone: Pharmacology Competency Assessment"
]);

const cpdGeneratorModules = makeModules(17, [
  "CPD Framework & Professional Development Planning", "Reflective Practice in Clinical Medicine", "Evidence-Based Medicine Fundamentals",
  "Critical Appraisal of Research Literature", "Clinical Audit Methodology", "Quality Improvement Science (QIS)",
  "Patient Safety Culture & Incident Reporting", "Root Cause Analysis (RCA)", "Morbidity & Mortality Conferences",
  "Clinical Governance Frameworks", "Interprofessional Education & Collaboration", "Leadership in Healthcare",
  "Healthcare Management Principles", "Health Economics & Resource Allocation", "Medical Ethics: Principles & Cases",
  "Informed Consent & Capacity Assessment", "Confidentiality & Data Protection in Medicine", "End-of-Life Ethics & Palliative Care",
  "Communication Skills: Breaking Bad News", "Communication Skills: Difficult Conversations", "Medico-Legal Aspects of Practice",
  "Complaints Handling & Duty of Candour", "Revalidation & Appraisal Processes", "Portfolio Development for CPD",
  "Simulation-Based Medical Education", "Procedural Skills Maintenance", "Advanced Life Support (ALS) Recertification",
  "Paediatric Advanced Life Support (PALS)", "Neonatal Resuscitation Program (NRP)", "Trauma Life Support (ATLS) Overview",
  "Sepsis Recognition & Management Update", "Antimicrobial Stewardship", "Infection Prevention & Control Update",
  "Mental Health First Aid for Clinicians", "Burnout Prevention & Wellbeing", "Diversity, Equity & Inclusion in Healthcare",
  "Global Health Competencies", "Digital Health Literacy for Clinicians", "Research Governance & Ethics",
  "Capstone: CPD Portfolio Submission & 60-Point Certification"
]);

export const CLINICAL_COURSES: Course[] = [
  {
    id: 10, slug: "insulin-certification", title: "Insulin Certification Program",
    description: "Comprehensive insulin therapy certification covering pharmacology, injection techniques, pump therapy, hypoglycemia management, and patient education across all patient populations.",
    category: "clinical", subcategory: "endocrinology", totalModules: 40, cpdPoints: 10,
    difficulty: "intermediate", estimatedHours: 50, icon: "Syringe", color: "yellow",
    modules: insulinModules,
  },
  {
    id: 11, slug: "certified-nursing-assistant", title: "Certified Nursing Assistant (CNA)",
    description: "Full CNA certification curriculum: patient care fundamentals, vital signs, personal hygiene, mobility assistance, infection control, and end-of-life care.",
    category: "clinical", subcategory: "nursing", totalModules: 40, cpdPoints: 10,
    difficulty: "beginner", estimatedHours: 50, icon: "Heart", color: "pink",
    modules: cnaModules,
  },
  {
    id: 12, slug: "emergency-medical-technician", title: "Emergency Medical Technician (EMT)",
    description: "EMT certification program covering patient assessment, airway management, trauma care, cardiac emergencies, pediatric emergencies, and mass casualty incident response.",
    category: "clinical", subcategory: "emergency", totalModules: 40, cpdPoints: 10,
    difficulty: "intermediate", estimatedHours: 50, icon: "Ambulance", color: "red",
    modules: emtModules,
  },
  {
    id: 13, slug: "clinical-skills-core", title: "Core Clinical Skills",
    description: "Master essential clinical examination techniques, procedural skills (venepuncture, catheterization, ECG), diagnostic interpretation, and safe prescribing for clinical practice.",
    category: "clinical", subcategory: "core", totalModules: 40, cpdPoints: 10,
    difficulty: "intermediate", estimatedHours: 50, icon: "Stethoscope", color: "blue",
    modules: clinicalSkillsModules,
  },
  {
    id: 14, slug: "biostatistics-research", title: "Biostatistics & Research Methodology",
    description: "Statistical methods for clinical research: hypothesis testing, regression, survival analysis, RCT design, systematic reviews, meta-analysis, and research protocol development.",
    category: "clinical", subcategory: "research", totalModules: 40, cpdPoints: 10,
    difficulty: "advanced", estimatedHours: 50, icon: "ChartBar", color: "purple",
    modules: biostatisticsModules,
  },
  {
    id: 15, slug: "human-health-foundations", title: "Human Health Foundations",
    description: "Foundational human biology, physiology, nutrition, epidemiology, and health promotion principles essential for all healthcare professionals.",
    category: "clinical", subcategory: "foundations", totalModules: 40, cpdPoints: 10,
    difficulty: "beginner", estimatedHours: 50, icon: "Activity", color: "green",
    modules: humanHealthModules,
  },
  {
    id: 16, slug: "pharmacology", title: "Pharmacology for Clinical Practice",
    description: "Clinical pharmacology from pharmacokinetics to drug classes: cardiovascular, CNS, antimicrobials, chemotherapy, and special populations including pediatric and geriatric patients.",
    category: "clinical", subcategory: "pharmacology", totalModules: 40, cpdPoints: 10,
    difficulty: "advanced", estimatedHours: 50, icon: "Pill", color: "orange",
    modules: pharmacologyModules,
  },
  {
    id: 17, slug: "cpd-generator-clinical", title: "CPD Generator — Clinical Medicine",
    description: "Earn 60 CPD points through structured reflective practice, clinical audit, quality improvement, ethics, leadership, and advanced life support recertification modules.",
    category: "clinical", subcategory: "cpd", totalModules: 40, cpdPoints: 60,
    difficulty: "expert", estimatedHours: 80, icon: "Award", color: "gold",
    modules: cpdGeneratorModules,
  },
];

export const ALL_COURSES: Course[] = [...TECHSKILLS_COURSES, ...ONCOAI_COURSES, ...CLINICAL_COURSES];
