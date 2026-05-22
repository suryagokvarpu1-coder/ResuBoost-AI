import { useState, useRef } from 'react';

const SAMPLE_JD = `Senior Project Manager
We are seeking an experienced Project Manager to lead cross-functional teams in delivering high-impact projects.
Key Responsibilities:
- Lead the planning, execution, and delivery of complex, multi-departmental initiatives.
- Define project scope, goals, and deliverables in collaboration with senior management.
- Develop comprehensive project plans and track progress using modern agile or waterfall methodologies.
- Proactively manage risks, dependencies, and resolve critical blocking issues.
- Communicate effectively with stakeholders at all levels, providing clear executive summaries.

Requirements:
- 5+ years of professional project management or leadership experience.
- Strong proficiency in risk management, resource allocation, and timeline tracking.
- Experience with management software (e.g., Jira, Asana, Microsoft Project).
- Excellent verbal and written communication skills.
- Relevant certification (PMP, Agile Scrum Master, or equivalent) is highly preferred.`;

const SAMPLE_RESUME = `JANE DOE - SENIOR PROJECT MANAGER
jane.doe@email.com | (123) 456-7890 | linkedin.com/in/janedoe

SUMMARY
Strategic and detail-oriented Project Manager with over 6 years of experience leading cross-functional teams to deliver enterprise-level initiatives on time and under budget. Proven track record in risk mitigation, stakeholder management, and process optimization.

EXPERIENCE
Senior Project Manager | Global Solutions Inc. (2020 - Present)
- Spearheaded the end-to-end delivery of a $2M enterprise infrastructure upgrade, finishing 2 weeks ahead of schedule.
- Managed a cross-functional team of 15 members across engineering, marketing, and operations.
- Implemented Agile methodologies, increasing team velocity by 25% and reducing critical bugs by 15%.
- Facilitated weekly stakeholder meetings to report on key performance indicators (KPIs) and project milestones.

Project Coordinator | Horizon Enterprises (2017 - 2020)
- Assisted in the tracking and reporting of over 20 concurrent projects.
- Developed automated reporting dashboards that saved 10 hours of manual work per week.
- Coordinated risk assessment workshops to identify potential delivery bottlenecks.

EDUCATION
B.S. in Business Administration | State University (2013 - 2017)

SKILLS
Project Management, Agile & Scrum, Risk Assessment, Cross-Functional Leadership, Budgeting, Jira, Asana, Microsoft Project, Stakeholder Communication.`;

export default function ResumeAnalyzer({ apiKey, onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const loadingMessages = [
    'Parsing file contents...',
    'Analyzing resume structure...',
    'Extracting key skills & technologies...',
    'Matching against job requirements...',
    'Connecting to AI engine for custom insights...',
    'Generating scoring reports...'
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    setError('');
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedTypes.includes(selectedFile.type) || 
        selectedFile.name.endsWith('.pdf') || 
        selectedFile.name.endsWith('.docx') || 
        selectedFile.name.endsWith('.txt')) {
      setFile(selectedFile);
      setResumeText(''); // Clear text-area input if file is uploaded
    } else {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
    }
  };

  const loadPreset = () => {
    setJobDescription(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
    setFile(null);
    setError('');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!file && !resumeText.trim()) {
      setError('Please upload a resume file or paste your resume text.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please paste the target job description to match against.');
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    
    // Rotate loading text every 1.5 seconds
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('resume', file);
      } else {
        formData.append('resumeText', resumeText);
      }
      formData.append('jobDescription', jobDescription);

      const headers = {};
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server returned an error.');
      }

      const data = await response.json();
      onAnalysisComplete(data, jobDescription);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during resume analysis.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card animate-fade-in" style={{ 
        textAlign: 'center', 
        padding: '4rem 2rem', 
        maxWidth: '600px', 
        margin: '2rem auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        {/* Animated Custom Loader */}
        <div style={{
          width: '70px',
          height: '70px',
          border: '4px solid rgba(59, 130, 246, 0.1)',
          borderTop: '4px solid var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', marginTop: '1rem' }}>
          Analyzing Resume
        </h3>
        
        <p className="glow-text-primary" style={{ fontSize: '1.1rem', height: '1.5rem', transition: 'all 0.3s' }}>
          {loadingMessages[loadingStep]}
        </p>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          This may take a few seconds while our local parser and Gemini AI evaluate content.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Introduction Banner */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.5rem' }}>
          AI <span className="glow-text-gradient">Resume Analyzer</span> & ATS Optimizer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
          Upload your resume and paste a job description. Get an instant compatibility score, keyword recommendations, and AI bullet optimization.
        </p>
      </div>

      {error && (
        <div className="badge badge-danger animate-fade-in" style={{ display: 'block', padding: '0.75rem', fontSize: '0.9rem', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleAnalyze} className="grid-2">
        
        {/* Left Side: Resume Upload & Input */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>1. Add Your Resume</h3>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={loadPreset}
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
            >
              🚀 Load Sample Preset
            </button>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            style={{
              border: isDragging ? '2px dashed var(--color-primary)' : '2px dashed var(--border-color)',
              background: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.doc,.txt"
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '2.5rem' }}>📁</span>
            {file ? (
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', marginTop: '0.5rem' }}
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600 }}>Drag & Drop file here, or click to browse</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Supports PDF, DOCX, and TXT up to 5MB
                </p>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            — OR —
          </div>

          {/* Fallback Text Input */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Paste Resume Text Plainly</label>
            <textarea
              className="form-textarea"
              placeholder="Paste your resume contents here..."
              rows={8}
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                if (file) setFile(null); // Clear file if text is pasted
              }}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Right Side: Job Description Input */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>2. Target Job Description</h3>

          <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0 }}>
            <label className="form-label">Paste Job Description</label>
            <textarea
              className="form-textarea"
              placeholder="Paste the job advertisement or role requirements here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{ flex: 1, minHeight: '300px', resize: 'vertical' }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
            ⚡ Run ATS Audit & Optimizer
          </button>
        </div>
      </form>
    </div>
  );
}
