import { useState, useRef } from 'react';

const SAMPLE_JD_FRONTEND = `React Software Engineer
We are seeking a React Software Engineer to join our dynamic frontend team.
Key Responsibilities:
- Build reusable UI components and libraries using React, HTML5, CSS3, and JavaScript/TypeScript.
- Optimize web applications for maximum speed, scalability, and modern UI responsiveness.
- Collaborate with UI/UX designers to translate Figma design mockups into pixel-perfect code.
- Implement state management using Redux or context API.
- Standardize code quality with Jest and Cypress unit/integration testing.
- Implement CI/CD pipelines using GitHub Actions.

Requirements:
- 3+ years of professional React experience.
- Strong proficiency in JavaScript/ES6+, CSS grid/flexbox, and Tailwind CSS.
- Experience with Next.js, Webpack, Vite, and REST APIs.
- Familiarity with Git, Docker, and Agile Scrum methodologies.`;

const SAMPLE_RESUME_FRONTEND = `JANE DOE - FRONTEND DEVELOPER
jane.doe@email.com | (123) 456-7890 | linkedin.com/in/janedoe | github.com/octocat

SUMMARY
Detail-oriented Frontend Developer with 4 years of experience specializing in building responsive, accessible, and user-friendly web applications using React.

EXPERIENCE
Frontend Engineer | Tech Corp (2023 - Present)
- Worked on creating and maintaining multiple client-facing React web applications.
- Collaborated with UI/UX designers to build reusable component libraries.
- Wrote unit tests for components to ensure stability and code quality.
- Helped with website SEO, increasing traffic by 10%.

Junior Developer | Web Agency (2021 - 2023)
- Built websites using HTML, CSS, JavaScript, and jQuery.
- Fixed layout styling bugs and optimized page loading speeds.

EDUCATION
B.S. in Computer Science | State University (2017 - 2021)

SKILLS
React, JavaScript, HTML5, CSS3, Git, REST APIs, Redux, Figma, jQuery.`;

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
    setJobDescription(SAMPLE_JD_FRONTEND);
    setResumeText(SAMPLE_RESUME_FRONTEND);
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
