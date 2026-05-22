// ResuBoost AI — Universal Careers Database
// Covers all professional domains across India and global markets

export const USER_CATEGORIES = [
  { id: 'student_10', label: 'Student (After 10th Class)', icon: '📘', color: '#3b82f6' },
  { id: 'student_12', label: 'Student (After 12th / Intermediate)', icon: '📗', color: '#6366f1' },
  { id: 'student_diploma', label: 'Diploma Student', icon: '📜', color: '#8b5cf6' },
  { id: 'student_ug', label: 'Undergraduate Student', icon: '🎓', color: '#a855f7' },
  { id: 'student_pg', label: 'Postgraduate Student', icon: '🏛️', color: '#d946ef' },
  { id: 'student_research', label: 'Research Scholar / PhD', icon: '🔬', color: '#ec4899' },
  { id: 'fresher', label: 'Fresher / Recent Graduate', icon: '🌱', color: '#10b981' },
  { id: 'intern', label: 'Intern', icon: '💼', color: '#06b6d4' },
  { id: 'experienced', label: 'Experienced Professional', icon: '🏆', color: '#f59e0b' },
  { id: 'software_pro', label: 'Software / IT Professional', icon: '💻', color: '#3b82f6' },
  { id: 'hardware_eng', label: 'Hardware / Embedded Engineer', icon: '🔧', color: '#64748b' },
  { id: 'ai_data', label: 'AI / Data Science Professional', icon: '🤖', color: '#8b5cf6' },
  { id: 'lawyer', label: 'Lawyer / Legal Professional', icon: '⚖️', color: '#d97706' },
  { id: 'doctor', label: 'Doctor / Healthcare Professional', icon: '🏥', color: '#ef4444' },
  { id: 'architect', label: 'Architect / Civil Engineer', icon: '🏗️', color: '#78716c' },
  { id: 'defense', label: 'Defense / Security Aspirant', icon: '🎖️', color: '#16a34a' },
  { id: 'govt_aspirant', label: 'Government Job Aspirant', icon: '🏛️', color: '#0891b2' },
  { id: 'entrepreneur', label: 'Entrepreneur / Startup Founder', icon: '🚀', color: '#f97316' },
  { id: 'freelancer', label: 'Freelancer / Remote Worker', icon: '🌐', color: '#22c55e' },
  { id: 'teacher', label: 'Teacher / Lecturer / Researcher', icon: '📚', color: '#84cc16' },
  { id: 'banking', label: 'Banking / Finance Professional', icon: '🏦', color: '#eab308' },
  { id: 'marketing', label: 'Marketing / Media / Communications', icon: '📣', color: '#f43f5e' },
  { id: 'management', label: 'Manager / MBA Professional', icon: '📊', color: '#6366f1' },
  { id: 'skilled_worker', label: 'Skilled Worker / Technician', icon: '🔩', color: '#78716c' },
  { id: 'vocational', label: 'Vocational / Trade Professional', icon: '🛠️', color: '#92400e' },
  { id: 'businessman', label: 'Businessman / Trader', icon: '🤝', color: '#059669' },
];

export const DOMAINS = {
  software_it: {
    id: 'software_it',
    label: 'Software & IT',
    icon: '💻',
    color: '#3b82f6',
    description: 'Full-stack development, cloud computing, DevOps, cybersecurity, and enterprise software',
    subDomains: [
      { id: 'frontend', label: 'Frontend Development', icon: '🖥️', skills: ['React', 'Vue.js', 'Angular', 'TypeScript', 'Next.js', 'CSS/Tailwind', 'Figma'], avgSalary: '₹6–25 LPA', demand: 'Very High' },
      { id: 'backend', label: 'Backend Development', icon: '⚙️', skills: ['Node.js', 'Python', 'Java Spring', 'Go', 'PostgreSQL', 'Redis', 'REST/GraphQL'], avgSalary: '₹7–30 LPA', demand: 'Very High' },
      { id: 'fullstack', label: 'Full-Stack Development', icon: '🔄', skills: ['MERN/MEAN', 'Next.js', 'Django', 'Docker', 'AWS', 'CI/CD', 'Microservices'], avgSalary: '₹8–35 LPA', demand: 'Extremely High' },
      { id: 'devops', label: 'DevOps / Cloud Engineering', icon: '☁️', skills: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'GitHub Actions'], avgSalary: '₹10–45 LPA', demand: 'Extremely High' },
      { id: 'cybersecurity', label: 'Cybersecurity', icon: '🔒', skills: ['Ethical Hacking', 'CISSP', 'CEH', 'Penetration Testing', 'SIEM', 'SOC'], avgSalary: '₹8–40 LPA', demand: 'Very High' },
      { id: 'mobile', label: 'Mobile Development', icon: '📱', skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'App Store Optimization'], avgSalary: '₹7–28 LPA', demand: 'High' },
      { id: 'qa', label: 'QA / Testing', icon: '🧪', skills: ['Selenium', 'Jest', 'Cypress', 'Postman', 'JIRA', 'Agile', 'Performance Testing'], avgSalary: '₹5–20 LPA', demand: 'High' },
    ],
    topCompanies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys', 'TCS', 'Wipro', 'HCL', 'Razorpay', 'CRED'],
    topExams: ['GATE (CS)', 'GRE (for MS abroad)', 'AMCAT', 'Coding Competitions'],
    trendingSkills: ['AI/ML Integration', 'Rust', 'WebAssembly', 'Edge Computing', 'LLM Fine-tuning'],
    careerPaths: [
      { level: 'Entry', title: 'Junior Developer / SDE-1', years: '0–2', salary: '₹4–12 LPA' },
      { level: 'Mid', title: 'Software Engineer / SDE-2', years: '2–5', salary: '₹12–25 LPA' },
      { level: 'Senior', title: 'Senior Engineer / Tech Lead', years: '5–8', salary: '₹25–50 LPA' },
      { level: 'Expert', title: 'Staff Engineer / Architect', years: '8+', salary: '₹50–1.5 Cr LPA' },
    ]
  },

  hardware_embedded: {
    id: 'hardware_embedded',
    label: 'Hardware & Embedded Systems',
    icon: '🔧',
    color: '#64748b',
    description: 'VLSI design, embedded firmware, PCB design, IoT, and semiconductor industry',
    subDomains: [
      { id: 'vlsi', label: 'VLSI / Chip Design', icon: '🔬', skills: ['Verilog', 'VHDL', 'Cadence', 'Synopsys', 'System Verilog', 'Formal Verification'], avgSalary: '₹8–40 LPA', demand: 'Very High' },
      { id: 'embedded', label: 'Embedded Firmware', icon: '⚡', skills: ['C/C++', 'RTOS', 'ARM Cortex', 'STM32', 'ESP32', 'FreeRTOS', 'CAN/SPI/I2C'], avgSalary: '₹5–25 LPA', demand: 'High' },
      { id: 'iot', label: 'IoT / Connected Devices', icon: '📡', skills: ['MQTT', 'Raspberry Pi', 'Arduino', 'AWS IoT', 'Edge AI', 'LoRaWAN'], avgSalary: '₹6–22 LPA', demand: 'High' },
      { id: 'pcb', label: 'PCB / Circuit Design', icon: '🖥️', skills: ['Altium Designer', 'KiCAD', 'Eagle', 'Signal Integrity', 'EMC', 'Schematic Design'], avgSalary: '₹4–18 LPA', demand: 'Moderate' },
    ],
    topCompanies: ['Intel', 'Qualcomm', 'Texas Instruments', 'NVIDIA', 'Bosch', 'ARM', 'Tata Elxsi', 'L&T Technology'],
    topExams: ['GATE (ECE)', 'ISRO Scientist Exam', 'DRDO SET', 'VLSI Society India exams'],
    trendingSkills: ['AI at the Edge', 'RISC-V', 'Automotive AUTOSAR', '5G modem design'],
    careerPaths: [
      { level: 'Entry', title: 'Junior Embedded Engineer', years: '0–2', salary: '₹3–8 LPA' },
      { level: 'Mid', title: 'Embedded Systems Engineer', years: '2–5', salary: '₹8–18 LPA' },
      { level: 'Senior', title: 'Principal Hardware Engineer', years: '5–10', salary: '₹18–40 LPA' },
      { level: 'Expert', title: 'Hardware Architect / Fellow Engineer', years: '10+', salary: '₹40–90 LPA' },
    ]
  },

  ai_data_science: {
    id: 'ai_data_science',
    label: 'AI, ML & Data Science',
    icon: '🤖',
    color: '#8b5cf6',
    description: 'Machine learning, deep learning, NLP, computer vision, data engineering, and AI research',
    subDomains: [
      { id: 'ml_engineer', label: 'Machine Learning Engineer', icon: '🧠', skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'MLflow', 'Feature Engineering'], avgSalary: '₹10–50 LPA', demand: 'Extremely High' },
      { id: 'data_scientist', label: 'Data Scientist', icon: '📊', skills: ['Python', 'R', 'Statistics', 'SQL', 'Pandas', 'Tableau', 'Hypothesis Testing'], avgSalary: '₹8–35 LPA', demand: 'Extremely High' },
      { id: 'nlp', label: 'NLP / LLM Engineer', icon: '💬', skills: ['Transformers', 'HuggingFace', 'LangChain', 'RAG', 'Fine-tuning', 'Prompt Engineering'], avgSalary: '₹15–80 LPA', demand: 'Extremely High' },
      { id: 'cv', label: 'Computer Vision Engineer', icon: '👁️', skills: ['OpenCV', 'YOLO', 'CNNs', 'MediaPipe', 'Image Segmentation', 'ONNX'], avgSalary: '₹10–45 LPA', demand: 'Very High' },
      { id: 'data_engineer', label: 'Data Engineer', icon: '🔄', skills: ['Apache Spark', 'Kafka', 'Airflow', 'dbt', 'Snowflake', 'BigQuery', 'ETL/ELT'], avgSalary: '₹10–40 LPA', demand: 'Very High' },
    ],
    topCompanies: ['Google DeepMind', 'OpenAI', 'Microsoft AI', 'Meta AI', 'Amazon Science', 'Zoho AI', 'Sarvam AI'],
    topExams: ['GATE (DA)', 'GRE (for AI research)', 'Kaggle competitions', 'IIT JAM (for M.Sc. Statistics)'],
    trendingSkills: ['LLM Fine-tuning', 'Multimodal AI', 'AI Agents', 'Vector Databases', 'Responsible AI'],
    careerPaths: [
      { level: 'Entry', title: 'Junior Data Analyst / ML Intern', years: '0–2', salary: '₹5–15 LPA' },
      { level: 'Mid', title: 'Data Scientist / ML Engineer', years: '2–5', salary: '₹15–35 LPA' },
      { level: 'Senior', title: 'Senior ML Engineer / Research Scientist', years: '5–8', salary: '₹35–70 LPA' },
      { level: 'Expert', title: 'AI Researcher / Principal Scientist', years: '8+', salary: '₹70 LPA–1 Cr+' },
    ]
  },

  legal: {
    id: 'legal',
    label: 'Legal & Judiciary',
    icon: '⚖️',
    color: '#d97706',
    description: 'Litigation, corporate law, judiciary, legal tech, and law academia',
    subDomains: [
      { id: 'litigation', label: 'Litigation / Advocacy', icon: '⚖️', skills: ['Court Practice', 'Civil Procedure', 'Criminal Law', 'Evidence Act', 'Drafting'], avgSalary: '₹3–50 LPA (varies)', demand: 'Stable' },
      { id: 'corporate_law', label: 'Corporate Law', icon: '🏢', skills: ['M&A', 'Contracts', 'SEBI Compliance', 'Companies Act', 'Due Diligence'], avgSalary: '₹8–60 LPA', demand: 'High' },
      { id: 'judiciary', label: 'Judicial Services', icon: '🏛️', skills: ['Constitutional Law', 'Civil/Criminal Procedure', 'IPC', 'Essay Writing', 'GK'], avgSalary: '₹8–20 LPA (govt)', demand: 'Very High competition' },
      { id: 'legal_tech', label: 'Legal Tech', icon: '💡', skills: ['Contract Review AI', 'LegalZoom tools', 'E-discovery', 'CLM Software'], avgSalary: '₹10–30 LPA', demand: 'Emerging' },
      { id: 'ip_law', label: 'IP / Patent Law', icon: '🔏', skills: ['Patent Filing', 'Copyright Law', 'Trademark', 'IP Licensing', 'Tech Background'], avgSalary: '₹8–35 LPA', demand: 'High' },
    ],
    topCompanies: ['Cyril Amarchand Mangaldas', 'AZB & Partners', 'Trilegal', 'Khaitan & Co', 'J Sagar Associates', 'Nishith Desai'],
    topExams: ['CLAT', 'AILET', 'Judicial Services Exam (State-wise)', 'Bar Exam (Enrollment)', 'UPSC (Law Optional)', 'LLM Entrance Exams'],
    trendingSkills: ['Legal Tech', 'Data Privacy Law (DPDP Act)', 'Arbitration', 'ESG Compliance', 'Cybercrime Law'],
    careerPaths: [
      { level: 'Entry', title: 'Junior Associate / Law Intern', years: '0–2', salary: '₹3–8 LPA' },
      { level: 'Mid', title: 'Associate / Senior Associate', years: '2–6', salary: '₹8–20 LPA' },
      { level: 'Senior', title: 'Partner / Senior Counsel', years: '6–12', salary: '₹20–80 LPA' },
      { level: 'Expert', title: 'Senior Partner / Independent Advocate', years: '12+', salary: '₹50 LPA–Unlimited' },
    ]
  },

  medical_healthcare: {
    id: 'medical_healthcare',
    label: 'Medical & Healthcare',
    icon: '🏥',
    color: '#ef4444',
    description: 'Clinical medicine, surgery, public health, healthcare IT, pharma, and medical research',
    subDomains: [
      { id: 'clinical', label: 'Clinical Medicine / GP', icon: '🩺', skills: ['Patient Care', 'Diagnosis', 'Clinical Pharmacology', 'EMR Systems', 'Emergency Medicine'], avgSalary: '₹6–30 LPA', demand: 'Very High' },
      { id: 'surgery', label: 'Surgical Specialties', icon: '🔪', skills: ['Laparoscopy', 'Orthopedics', 'Neurosurgery', 'Cardiac Surgery', 'Robotic Surgery'], avgSalary: '₹15–100 LPA+', demand: 'Very High' },
      { id: 'public_health', label: 'Public Health / Epidemiology', icon: '🌍', skills: ['Epidemiology', 'Biostatistics', 'Health Policy', 'SPSS/R', 'Surveillance Systems'], avgSalary: '₹6–25 LPA', demand: 'High' },
      { id: 'health_it', label: 'Healthcare IT / Informatics', icon: '💻', skills: ['HL7 FHIR', 'EMR', 'Telemedicine', 'Health AI', 'HIPAA Compliance'], avgSalary: '₹8–35 LPA', demand: 'High' },
      { id: 'pharma', label: 'Pharmaceutical / Research', icon: '💊', skills: ['Clinical Trials', 'Regulatory Affairs', 'Drug Discovery', 'GMP', 'CDSCO'], avgSalary: '₹5–25 LPA', demand: 'High' },
    ],
    topCompanies: ['AIIMS', 'Apollo Hospitals', 'Fortis', 'Medanta', 'Sun Pharma', 'Cipla', 'Dr. Reddy\'s', 'Manipal Hospitals'],
    topExams: ['NEET-UG (MBBS)', 'NEET-PG (Specialization)', 'USMLE (USA)', 'PLAB (UK)', 'AIIMS PG', 'DNB Exams'],
    trendingSkills: ['Telemedicine', 'AI-assisted Diagnosis', 'Genomics', 'Medical Robotics', 'Mental Health'],
    careerPaths: [
      { level: 'Entry', title: 'MBBS Intern / House Officer', years: '0–2', salary: '₹2–6 LPA (stipend)' },
      { level: 'Mid', title: 'General Physician / Resident', years: '2–8', salary: '₹6–20 LPA' },
      { level: 'Senior', title: 'Specialist Consultant', years: '8–15', salary: '₹20–80 LPA' },
      { level: 'Expert', title: 'Senior Consultant / Professor', years: '15+', salary: '₹50 LPA–Unlimited' },
    ]
  },

  civil_architecture: {
    id: 'civil_architecture',
    label: 'Civil, Mechanical & Architecture',
    icon: '🏗️',
    color: '#78716c',
    description: 'Infrastructure, construction, structural engineering, architecture, and urban planning',
    subDomains: [
      { id: 'structural', label: 'Structural Engineering', icon: '🏗️', skills: ['AutoCAD', 'STAAD Pro', 'ETABS', 'Revit', 'Structural Analysis', 'IS Codes'], avgSalary: '₹4–20 LPA', demand: 'High' },
      { id: 'architecture', label: 'Architecture / Urban Design', icon: '🏛️', skills: ['AutoCAD', 'SketchUp', 'Revit', 'Lumion', 'BIM', 'Urban Planning', 'RERA'], avgSalary: '₹4–25 LPA', demand: 'Moderate' },
      { id: 'project_mgmt', label: 'Project Management', icon: '📋', skills: ['MS Project', 'Primavera', 'PMP', 'PERT/CPM', 'Contract Management', 'EPC'], avgSalary: '₹8–40 LPA', demand: 'High' },
      { id: 'mechanical', label: 'Mechanical / Manufacturing', icon: '⚙️', skills: ['SolidWorks', 'CATIA', 'FEA', 'CNC', 'GD&T', 'Lean Manufacturing', 'Six Sigma'], avgSalary: '₹4–25 LPA', demand: 'High' },
    ],
    topCompanies: ['L&T', 'DLF', 'Godrej Properties', 'NHAI', 'IRCON', 'BHEL', 'Tata Projects', 'Shapoorji Pallonji'],
    topExams: ['GATE (CE/ME)', 'UPSC ESE (Engineering Services)', 'State PSC AE Exams', 'COA Registration', 'RERA Agent'],
    trendingSkills: ['BIM (Building Information Modeling)', 'Green Building / LEED', 'Smart Cities', 'Drone Surveying', '3D Printing in Construction'],
    careerPaths: [
      { level: 'Entry', title: 'Site Engineer / Junior Architect', years: '0–3', salary: '₹3–7 LPA' },
      { level: 'Mid', title: 'Project Engineer / Associate Architect', years: '3–7', salary: '₹7–18 LPA' },
      { level: 'Senior', title: 'Project Manager / Senior Architect', years: '7–12', salary: '₹18–40 LPA' },
      { level: 'Expert', title: 'Director / Principal Architect', years: '12+', salary: '₹40 LPA–Unlimited' },
    ]
  },

  defense_security: {
    id: 'defense_security',
    label: 'Defense & Security',
    icon: '🎖️',
    color: '#16a34a',
    description: 'Indian Armed Forces, paramilitary, police services, and national security careers',
    subDomains: [
      { id: 'army', label: 'Indian Army', icon: '🪖', skills: ['Leadership', 'Physical Fitness', 'Tactical Operations', 'Map Reading', 'Communication'], avgSalary: '₹6–25 LPA (Grade Pay)', demand: 'Competitive' },
      { id: 'navy', label: 'Indian Navy', icon: '⚓', skills: ['Navigation', 'Marine Engineering', 'Underwater Warfare', 'Aircraft Operations', 'Seamanship'], avgSalary: '₹6–25 LPA', demand: 'Competitive' },
      { id: 'air_force', label: 'Indian Air Force', icon: '✈️', skills: ['Pilot Training', 'Aviation Mechanics', 'Air Defense', 'Radar Operations', 'Flight Communication'], avgSalary: '₹6–30 LPA', demand: 'Competitive' },
      { id: 'paramilitary', label: 'Paramilitary / CAPF', icon: '🛡️', skills: ['Law Enforcement', 'Border Security', 'Counter-terrorism', 'Physical Training'], avgSalary: '₹5–15 LPA', demand: 'High applications' },
      { id: 'police', label: 'Police / IPS', icon: '👮', skills: ['Law', 'Investigation', 'Community Policing', 'Forensics', 'Leadership'], avgSalary: '₹6–25 LPA (state-wise)', demand: 'High applications' },
    ],
    topCompanies: ['Ministry of Defence', 'MHA', 'BSF', 'CRPF', 'NSG', 'RAW', 'IB (Intelligence Bureau)'],
    topExams: ['NDA (National Defence Academy)', 'CDS (Combined Defence Services)', 'AFCAT', 'SSB Interview', 'CAPF AC Exam', 'UPSC IPS'],
    trendingSkills: ['Drone Warfare', 'Cyber Defence', 'AI in Defense', 'Space Security', 'Electronic Warfare'],
    careerPaths: [
      { level: 'Entry', title: 'Cadet / Constable / Sepoy', years: '0–3', salary: '₹3–8 LPA' },
      { level: 'Mid', title: 'Officer (Lieutenant/Captain/Inspector)', years: '3–10', salary: '₹8–20 LPA' },
      { level: 'Senior', title: 'Senior Officer (Major/Colonel/SP)', years: '10–20', salary: '₹20–35 LPA' },
      { level: 'Expert', title: 'General / DGP / Secretary Defence', years: '20+', salary: '₹35 LPA+ (with perks)' },
    ]
  },

  government: {
    id: 'government',
    label: 'Government Services',
    icon: '🏛️',
    color: '#0891b2',
    description: 'UPSC, SSC, banking, railways, state PSC, and central/state government jobs',
    subDomains: [
      { id: 'upsc_ias', label: 'UPSC IAS / Civil Services', icon: '🏛️', skills: ['General Studies', 'CSAT', 'Essay Writing', 'Optional Subject', 'Current Affairs', 'Ethics'], avgSalary: '₹8–20 LPA (grade pay + perks)', demand: 'Extremely Competitive' },
      { id: 'ssc', label: 'SSC Exams (CGL/CHSL/MTS)', icon: '📋', skills: ['Quantitative Aptitude', 'English', 'General Knowledge', 'Reasoning', 'Computer Basics'], avgSalary: '₹4–12 LPA', demand: 'Very High' },
      { id: 'railway', label: 'Railway (RRB/RRC)', icon: '🚂', skills: ['Technical Knowledge', 'Aptitude', 'GK', 'Reasoning', 'Railway Regulations'], avgSalary: '₹3–12 LPA', demand: 'Very High' },
      { id: 'state_psc', label: 'State PSC (PCS/AE/AO)', icon: '🗺️', skills: ['State GK', 'History/Geography', 'Polity', 'Economy', 'Optional Subject'], avgSalary: '₹5–15 LPA', demand: 'High' },
      { id: 'teaching', label: 'Govt Teaching (TET/NET/SET)', icon: '📚', skills: ['Subject Expertise', 'Pedagogy', 'Child Psychology', 'Educational Psychology'], avgSalary: '₹4–12 LPA', demand: 'High' },
    ],
    topCompanies: ['Central Govt Ministries', 'State Governments', 'PSUs', 'NDMA', 'NITI Aayog', 'Panchayati Raj'],
    topExams: ['UPSC CSE', 'SSC CGL', 'IBPS (Banking)', 'RRB NTPC', 'State PSC Exams', 'UPSC ESE', 'NHM Staff Nurse'],
    trendingSkills: ['e-Governance', 'Data Analysis for Policy', 'Digital India Initiatives', 'Public Finance Management'],
    careerPaths: [
      { level: 'Entry', title: 'Junior Clerk / Grade C Officer', years: '0–3', salary: '₹3–7 LPA' },
      { level: 'Mid', title: 'Section Officer / Assistant Commissioner', years: '3–10', salary: '₹7–15 LPA' },
      { level: 'Senior', title: 'Deputy Secretary / District Magistrate', years: '10–20', salary: '₹15–25 LPA' },
      { level: 'Expert', title: 'Secretary / Chief Secretary / Cabinet Secretary', years: '20+', salary: '₹25 LPA+ (with perks)' },
    ]
  },

  business_entrepreneurship: {
    id: 'business_entrepreneurship',
    label: 'Business & Entrepreneurship',
    icon: '🚀',
    color: '#f97316',
    description: 'Startup founding, business operations, product management, and entrepreneurship ecosystem',
    subDomains: [
      { id: 'startup_founder', label: 'Startup Founder / Co-founder', icon: '🚀', skills: ['Product Thinking', 'GTM Strategy', 'Fundraising', 'Team Building', 'Financial Modeling', 'Pitch Deck'], avgSalary: 'Variable (equity-based)', demand: 'Growing ecosystem' },
      { id: 'product_mgmt', label: 'Product Management', icon: '📦', skills: ['Roadmapping', 'User Research', 'Data Analytics', 'Agile/Scrum', 'Jira', 'A/B Testing'], avgSalary: '₹12–60 LPA', demand: 'Very High' },
      { id: 'operations', label: 'Business Operations / Strategy', icon: '📊', skills: ['Operations Research', 'Supply Chain', 'ERP (SAP)', 'Six Sigma', 'Business Intelligence'], avgSalary: '₹8–35 LPA', demand: 'High' },
      { id: 'consulting', label: 'Management Consulting', icon: '💼', skills: ['Problem Solving', 'Case Studies', 'Excel/PowerPoint', 'Market Research', 'Communication'], avgSalary: '₹12–60 LPA', demand: 'High' },
    ],
    topCompanies: ['McKinsey', 'BCG', 'Bain', 'Deloitte', 'EY', 'KPMG', 'Razorpay', 'Zepto', 'Meesho', 'Zomato'],
    topExams: ['CAT (IIMs)', 'XAT', 'GMAT (Global MBA)', 'SNAP', 'MAT', 'CMAT', 'GRE (MS Management)'],
    trendingSkills: ['AI for Business', 'ESG / Sustainability', 'D2C Brand Building', 'Venture Capital', 'SaaS Growth'],
    careerPaths: [
      { level: 'Entry', title: 'Management Trainee / Business Analyst', years: '0–2', salary: '₹6–15 LPA' },
      { level: 'Mid', title: 'Product Manager / Strategy Manager', years: '2–5', salary: '₹15–35 LPA' },
      { level: 'Senior', title: 'VP / Director / General Manager', years: '5–10', salary: '₹35–80 LPA' },
      { level: 'Expert', title: 'C-Suite / Founder / Partner', years: '10+', salary: '₹80 LPA–Unlimited' },
    ]
  },

  banking_finance: {
    id: 'banking_finance',
    label: 'Banking, Finance & Commerce',
    icon: '🏦',
    color: '#eab308',
    description: 'Commercial banking, investment banking, fintech, accounting, and financial planning',
    subDomains: [
      { id: 'banking_ops', label: 'Banking Operations', icon: '🏦', skills: ['RBI Guidelines', 'Credit Analysis', 'KYC/AML', 'Core Banking (Finacle)', 'Loans & Deposits'], avgSalary: '₹4–15 LPA', demand: 'High' },
      { id: 'investment', label: 'Investment Banking / Capital Markets', icon: '📈', skills: ['Financial Modeling', 'DCF Valuation', 'M&A', 'Bloomberg', 'Equity Research'], avgSalary: '₹12–80 LPA', demand: 'Very High' },
      { id: 'ca_cfa', label: 'Chartered Accountancy / CFA', icon: '📑', skills: ['Accounting Standards (IFRS/Ind AS)', 'Audit', 'Taxation (GST/ITR)', 'Cost Accounting', 'Company Law'], avgSalary: '₹8–50 LPA', demand: 'Very High' },
      { id: 'fintech', label: 'FinTech / Digital Finance', icon: '💳', skills: ['Payment Gateways', 'Blockchain', 'RegTech', 'Open Banking APIs', 'UPI Integration'], avgSalary: '₹10–45 LPA', demand: 'Very High' },
    ],
    topCompanies: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Goldman Sachs', 'Morgan Stanley', 'Razorpay', 'PhonePe', 'Groww'],
    topExams: ['IBPS PO/Clerk', 'SBI PO', 'RBI Grade B', 'CA (ICAI)', 'CFA (CFA Institute)', 'CS (ICSI)', 'NISM Certifications'],
    trendingSkills: ['Crypto/DeFi', 'AI in Finance', 'CBDC', 'ESG Investing', 'RegTech Compliance'],
    careerPaths: [
      { level: 'Entry', title: 'Banking Assistant / Junior Accountant', years: '0–2', salary: '₹3–8 LPA' },
      { level: 'Mid', title: 'Financial Analyst / Branch Manager', years: '2–7', salary: '₹8–25 LPA' },
      { level: 'Senior', title: 'Senior Manager / Portfolio Manager', years: '7–12', salary: '₹25–60 LPA' },
      { level: 'Expert', title: 'CFO / MD / Fund Manager', years: '12+', salary: '₹60 LPA–Unlimited' },
    ]
  },

  marketing_media: {
    id: 'marketing_media',
    label: 'Marketing, Media & Communications',
    icon: '📣',
    color: '#f43f5e',
    description: 'Digital marketing, brand management, journalism, content creation, and advertising',
    subDomains: [
      { id: 'digital_mktg', label: 'Digital Marketing', icon: '📱', skills: ['SEO/SEM', 'Google Ads', 'Meta Ads', 'Email Marketing', 'Analytics (GA4)', 'HubSpot'], avgSalary: '₹4–20 LPA', demand: 'Very High' },
      { id: 'content', label: 'Content Creation / Strategy', icon: '✍️', skills: ['Copywriting', 'Video Production', 'YouTube/OTT', 'Podcasting', 'Newsletter/Blog'], avgSalary: '₹3–20 LPA', demand: 'High' },
      { id: 'brand_mgmt', label: 'Brand Management', icon: '🏷️', skills: ['Brand Strategy', 'Consumer Insights', 'Campaign Management', 'Creative Briefs', 'PR'], avgSalary: '₹6–30 LPA', demand: 'High' },
      { id: 'journalism', label: 'Journalism / Mass Media', icon: '📰', skills: ['Reporting', 'Fact-checking', 'Video Journalism', 'Data Journalism', 'Editing'], avgSalary: '₹3–15 LPA', demand: 'Moderate' },
    ],
    topCompanies: ['WPP', 'Publicis', 'Dentsu', 'GroupM', 'Ogilvy', 'McCann', 'Zomato Marketing', 'Amazon Advertising'],
    topExams: ['MICA PGDM', 'NIFT', 'IIMC (Journalism)', 'Xavier (Mass Comm)', 'Google Certifications', 'Meta Blueprint'],
    trendingSkills: ['AI Content Generation', 'Influencer Marketing', 'Creator Economy', 'Short-Form Video', 'MarTech Stacks'],
    careerPaths: [
      { level: 'Entry', title: 'Junior Marketer / Content Writer', years: '0–2', salary: '₹3–7 LPA' },
      { level: 'Mid', title: 'Marketing Manager / Brand Manager', years: '2–6', salary: '₹7–20 LPA' },
      { level: 'Senior', title: 'Head of Marketing / Creative Director', years: '6–12', salary: '₹20–50 LPA' },
      { level: 'Expert', title: 'CMO / Brand President', years: '12+', salary: '₹50 LPA–Unlimited' },
    ]
  },

  teaching_research: {
    id: 'teaching_research',
    label: 'Teaching, Academia & Research',
    icon: '📚',
    color: '#84cc16',
    description: 'School teaching, college lecturing, university research, and academic publishing',
    subDomains: [
      { id: 'school_teacher', label: 'School Teacher (Govt/Private)', icon: '🏫', skills: ['Subject Expertise', 'Pedagogy', 'Classroom Management', 'NEP 2020', 'CBSE/ICSE Curriculum'], avgSalary: '₹3–10 LPA', demand: 'High' },
      { id: 'college_lecturer', label: 'College Lecturer / Assistant Professor', icon: '🎓', skills: ['Research Publications', 'NET/PhD', 'Curriculum Design', 'Academic Mentoring', 'Grant Writing'], avgSalary: '₹6–18 LPA (7th CPC)', demand: 'High' },
      { id: 'research_scientist', label: 'Research Scientist / Fellow', icon: '🔬', skills: ['Research Methodology', 'Data Analysis', 'Grant Writing', 'Publication (SCI/Scopus)', 'Lab Management'], avgSalary: '₹5–25 LPA (fellowship-based)', demand: 'Moderate' },
      { id: 'edtech', label: 'EdTech Content / Curriculum Design', icon: '💡', skills: ['Instructional Design', 'Video Scripting', 'LMS Platforms', 'Assessment Design', 'Gamification'], avgSalary: '₹5–20 LPA', demand: 'High' },
    ],
    topCompanies: ['CBSE Schools', 'IITs/NITs/IIMs', 'CSIR Labs', 'ISRO Research', 'ICMR', 'Byju\'s', 'Unacademy', 'Vedantu'],
    topExams: ['UGC-NET', 'CSIR-NET', 'TET (State)', 'CTET', 'GATE (for JRF)', 'HPCL/ONGC Scholarships', 'NBHM (Maths)'],
    trendingSkills: ['AI in Education', 'Blended Learning', 'MOOC Development', 'Learning Analytics', 'STEM/STEAM Integration'],
    careerPaths: [
      { level: 'Entry', title: 'Graduate Teaching Assistant / Junior Lecturer', years: '0–3', salary: '₹3–8 LPA' },
      { level: 'Mid', title: 'Assistant Professor / Senior Researcher', years: '3–8', salary: '₹8–18 LPA' },
      { level: 'Senior', title: 'Associate Professor / Principal Investigator', years: '8–15', salary: '₹18–30 LPA' },
      { level: 'Expert', title: 'Full Professor / Dean / Director', years: '15+', salary: '₹30 LPA+' },
    ]
  },

  skilled_vocational: {
    id: 'skilled_vocational',
    label: 'Skilled Trades & Vocational',
    icon: '🔩',
    color: '#78716c',
    description: 'ITI, NSDC certified trades, technician roles, and vocational career pathways',
    subDomains: [
      { id: 'electrician', label: 'Electrician / Electrical Tech', icon: '⚡', skills: ['Wiring', 'Panel Boards', 'Motor Winding', 'PLC', 'Safety Standards', 'IEEMA'], avgSalary: '₹2–10 LPA', demand: 'Very High' },
      { id: 'welder', label: 'Welder / Fabricator', icon: '🔥', skills: ['MIG/TIG Welding', 'Arc Welding', 'Blueprint Reading', 'Metal Fabrication', 'NDT'], avgSalary: '₹2–8 LPA', demand: 'High' },
      { id: 'plumber', label: 'Plumber / Pipefitter', icon: '🔧', skills: ['Pipe Fitting', 'Drainage Systems', 'HVAC', 'Safety Codes', 'Hydraulics'], avgSalary: '₹2–8 LPA', demand: 'High' },
      { id: 'beauty_wellness', label: 'Beauty & Wellness', icon: '💆', skills: ['Hair Styling', 'Skin Care', 'Makeup Artist', 'Salon Management', 'Nail Art'], avgSalary: '₹2–15 LPA (own salon)', demand: 'High' },
      { id: 'automobile_tech', label: 'Automobile Technician', icon: '🚗', skills: ['Engine Diagnostics', 'EV Maintenance', 'Auto Electricals', 'OEMS Tools', 'Body Shop'], avgSalary: '₹2–10 LPA', demand: 'Very High (EV boom)' },
    ],
    topCompanies: ['L&T Construction', 'BHEL', 'TATA Motors', 'Maruti Suzuki', 'Godrej & Boyce', 'Bosch India', 'NSDC Partners'],
    topExams: ['ITI Trade Certificate', 'NSDC/NCVT Certification', 'PMKVY (Govt Skill Training)', 'Apprenticeship Act Exams', 'State Skill Mission'],
    trendingSkills: ['EV Battery Servicing', 'Solar Installation', 'Robotics Maintenance', 'CNC Operation', 'Green Building Techniques'],
    careerPaths: [
      { level: 'Entry', title: 'Apprentice / Helper', years: '0–2', salary: '₹1.5–4 LPA' },
      { level: 'Mid', title: 'Skilled Technician / Tradesman', years: '2–5', salary: '₹4–8 LPA' },
      { level: 'Senior', title: 'Senior Technician / Foreman', years: '5–10', salary: '₹8–15 LPA' },
      { level: 'Expert', title: 'Supervisor / Workshop Owner', years: '10+', salary: '₹15 LPA–Unlimited' },
    ]
  },

  freelancing: {
    id: 'freelancing',
    label: 'Freelancing & Remote Work',
    icon: '🌐',
    color: '#22c55e',
    description: 'Independent consulting, remote employment, gig economy, and location-independent careers',
    subDomains: [
      { id: 'freelance_dev', label: 'Freelance Developer', icon: '💻', skills: ['Portfolio Building', 'Client Communication', 'Upwork/Fiverr', 'Rate Setting', 'Contract Drafting'], avgSalary: '$25–150/hr', demand: 'Very High' },
      { id: 'freelance_design', label: 'Freelance Designer / Creative', icon: '🎨', skills: ['Figma', 'Adobe Creative Suite', 'Brand Identity', 'Motion Graphics', 'UI/UX'], avgSalary: '$20–100/hr', demand: 'High' },
      { id: 'freelance_writing', label: 'Content Writer / Copywriter', icon: '✍️', skills: ['SEO Writing', 'Technical Writing', 'Ghost Writing', 'Ghostwriting', 'Grammarly/Hemingway'], avgSalary: '$10–80/hr', demand: 'High' },
      { id: 'remote_employee', label: 'Remote Employee (Full-Time)', icon: '🏠', skills: ['Self-Management', 'Remote Collaboration Tools (Slack/Notion)', 'Time Zone Management', 'Async Communication'], avgSalary: 'Varies by role', demand: 'Very High' },
    ],
    topCompanies: ['Upwork', 'Fiverr', 'Toptal', 'Freelancer.com', 'Remote.com', 'Deel', 'WeWork Remotely'],
    topExams: ['Platform Certifications (Upwork)', 'Google/HubSpot Certs', 'Portfolio Quality Reviews'],
    trendingSkills: ['AI Prompting for Freelancers', 'No-Code Tools', 'Digital Products', 'Agency Building', 'Personal Branding'],
    careerPaths: [
      { level: 'Entry', title: 'New Freelancer / Gig Worker', years: '0–1', salary: '$10–25/hr' },
      { level: 'Mid', title: 'Established Freelancer', years: '1–3', salary: '$25–75/hr' },
      { level: 'Senior', title: 'Consultant / Agency Owner', years: '3–7', salary: '$75–200/hr' },
      { level: 'Expert', title: 'Thought Leader / SaaS Founder', years: '7+', salary: 'Unlimited' },
    ]
  }
};

export const GOVERNMENT_SCHEMES = [
  { name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)', category: 'Skill Development', eligibility: 'All Indians (10th pass+)', benefit: 'Free skill training + certification', link: 'https://www.pmkvyofficial.org' },
  { name: 'Startup India', category: 'Entrepreneurship', eligibility: 'Registered startups in India', benefit: 'Tax exemptions, funding, mentorship', link: 'https://www.startupindia.gov.in' },
  { name: 'Stand-Up India', category: 'Entrepreneurship', eligibility: 'SC/ST & Women entrepreneurs', benefit: 'Bank loans ₹10L–1Cr', link: 'https://www.standupmitra.in' },
  { name: 'National Apprenticeship Promotion Scheme (NAPS)', category: 'Skill Training', eligibility: 'ITI/Diploma/Graduate students', benefit: 'Stipend during apprenticeship', link: 'https://www.apprenticeship.gov.in' },
  { name: 'Atal Innovation Mission', category: 'Innovation', eligibility: 'Students & Innovators', benefit: 'Incubation, grants, mentorship', link: 'https://aim.gov.in' },
  { name: 'Digital India PMGDISHA', category: 'Digital Literacy', eligibility: 'Rural citizens', benefit: 'Free digital skills training', link: 'https://www.pmgdisha.in' },
  { name: 'National Career Service Portal', category: 'Employment', eligibility: 'All job seekers', benefit: 'Free job matching + career guidance', link: 'https://www.ncs.gov.in' },
  { name: 'e-Shram Portal', category: 'Unorganized Workers', eligibility: 'Gig/informal workers', benefit: 'Social security registration', link: 'https://eshram.gov.in' },
];

export default { USER_CATEGORIES, DOMAINS, GOVERNMENT_SCHEMES };
