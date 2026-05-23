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
  const [uploadMode, setUploadMode] = useState('single'); // 'single' | 'batch'
  
  // Single Mode
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  
  // Batch Mode
  const [batchQueue, setBatchQueue] = useState([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  
  // Shared
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);
  const batchInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const loadingMessages = [
    'Parsing file contents...',
    'Analyzing resume structure...',
    'Extracting key skills & technologies...',
    'Matching against job requirements...',
    'Connecting to AI engine for custom insights...',
    'Generating scoring reports...'
  ];

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];

  const isFileValid = (f) => allowedTypes.includes(f.type) || 
      f.name.endsWith('.pdf') || f.name.endsWith('.docx') || f.name.endsWith('.doc') || f.name.endsWith('.txt');

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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (uploadMode === 'single') {
        if (isFileValid(e.dataTransfer.files[0])) {
          setFile(e.dataTransfer.files[0]);
          setResumeText('');
        } else {
          setError('Unsupported file type. Please upload a PDF, DOCX, DOC, or TXT file.');
        }
      } else {
        const newFiles = Array.from(e.dataTransfer.files).filter(isFileValid).map(f => ({
          file: f,
          status: 'Pending',
          data: null,
          errorMsg: ''
        }));
        if (newFiles.length === 0) {
          setError('No valid resume files found in drop.');
        } else {
          setBatchQueue(prev => [...prev, ...newFiles]);
        }
      }
    }
  };

  const loadPreset = () => {
    setUploadMode('single');
    setJobDescription(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
    setFile(null);
    setError('');
  };

  // Process a single file against the API
  const processResumeAPI = async (activeFile, activeText, jd) => {
    const formData = new FormData();
    if (activeFile) formData.append('resume', activeFile);
    else formData.append('resumeText', activeText);
    formData.append('jobDescription', jd);

    const headers = {};
    if (apiKey) headers['x-api-key'] = apiKey;

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server returned an error.');
    }
    return await response.json();
  };

  const triggerSingleAnalysis = async () => {
    setError('');
    if (!file && !resumeText.trim()) {
      setError('Please upload a resume file or paste your resume text.');
      return;
    }

    setLoading(true);
    setLoadingStep(0);
    const interval = setInterval(() => setLoadingStep((prev) => (prev + 1) % loadingMessages.length), 1500);

    try {
      const data = await processResumeAPI(file, resumeText, jobDescription);
      onAnalysisComplete(data, jobDescription);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during resume analysis.');
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const triggerBatchAnalysis = async () => {
    if (batchQueue.length === 0) {
      setError('Please add at least one resume to the batch queue.');
      return;
    }
    setIsBatchProcessing(true);
    setError('');

    for (let i = 0; i < batchQueue.length; i++) {
      if (batchQueue[i].status !== 'Pending' && batchQueue[i].status !== 'Failed') continue;

      // Mark as Analyzing
      setBatchQueue(prev => {
        const newQ = [...prev];
        newQ[i].status = 'Analyzing';
        return newQ;
      });

      try {
        const data = await processResumeAPI(batchQueue[i].file, '', jobDescription);
        setBatchQueue(prev => {
          const newQ = [...prev];
          newQ[i].status = 'Completed';
          newQ[i].data = data;
          return newQ;
        });
      } catch (err) {
        setBatchQueue(prev => {
          const newQ = [...prev];
          newQ[i].status = 'Failed';
          newQ[i].errorMsg = err.message;
          return newQ;
        });
      }
    }
    setIsBatchProcessing(false);
  };

  if (loading && uploadMode === 'single') {
    return (
      <div className="glass-card animate-fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '2rem auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ width: '70px', height: '70px', border: '4px solid rgba(59, 130, 246, 0.1)', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', marginTop: '1rem' }}>Analyzing Resume</h3>
        <p className="glow-text-primary" style={{ fontSize: '1.1rem', height: '1.5rem', transition: 'all 0.3s' }}>{loadingMessages[loadingStep]}</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.5rem' }}>
          AI <span className="glow-text-gradient">Resume Analyzer</span> & ATS Optimizer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
          Instantly evaluate single resumes or process entire folders. AI-driven domain detection, ATS scoring, and professional analysis.
        </p>
        
        {/* Upload Mode Toggles */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button className={`btn ${uploadMode === 'single' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setUploadMode('single')} disabled={isBatchProcessing}>
            📄 Single Resume
          </button>
          <button className={`btn ${uploadMode === 'batch' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setUploadMode('batch')} disabled={isBatchProcessing}>
            📁 Batch / Folder Upload
          </button>
        </div>
      </div>

      {error && (
        <div className="badge badge-danger animate-fade-in" style={{ display: 'block', padding: '0.75rem', fontSize: '0.9rem', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); uploadMode === 'single' ? triggerSingleAnalysis() : triggerBatchAnalysis(); }} className="grid-2">
        
        {/* Left Side: Upload Area */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>1. Add Resumes</h3>
            {uploadMode === 'single' && (
              <button type="button" className="btn btn-secondary" onClick={loadPreset} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                🚀 Load Sample
              </button>
            )}
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => uploadMode === 'single' ? fileInputRef.current.click() : batchInputRef.current.click()}
            style={{
              border: isDragging ? '2px dashed var(--color-primary)' : '2px dashed var(--border-color)',
              background: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem'
            }}
          >
            {uploadMode === 'single' ? (
              <>
                <input type="file" ref={fileInputRef} onChange={(e) => { if(e.target.files[0] && isFileValid(e.target.files[0])) { setFile(e.target.files[0]); setResumeText(''); } }} accept=".pdf,.docx,.doc,.txt" style={{ display: 'none' }} />
                <span style={{ fontSize: '2.5rem' }}>📄</span>
                {file ? (
                  <div>
                    <p style={{ fontWeight: 600 }}>{file.name}</p>
                    <button type="button" className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', marginTop: '0.5rem' }}>Remove</button>
                  </div>
                ) : (
                  <div><p style={{ fontWeight: 600 }}>Drag & Drop file, or click to browse</p><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports PDF, DOCX, TXT</p></div>
                )}
              </>
            ) : (
              <>
                <input type="file" ref={batchInputRef} multiple onChange={(e) => {
                  const newFiles = Array.from(e.target.files).filter(isFileValid).map(f => ({ file: f, status: 'Pending', data: null, errorMsg: '' }));
                  setBatchQueue(prev => [...prev, ...newFiles]);
                }} accept=".pdf,.docx,.doc,.txt" style={{ display: 'none' }} />
                <input type="file" ref={folderInputRef} webkitdirectory="true" directory="true" multiple onChange={(e) => {
                  const newFiles = Array.from(e.target.files).filter(isFileValid).map(f => ({ file: f, status: 'Pending', data: null, errorMsg: '' }));
                  setBatchQueue(prev => [...prev, ...newFiles]);
                }} style={{ display: 'none' }} />
                
                <span style={{ fontSize: '2.5rem' }}>📁</span>
                <div>
                  <p style={{ fontWeight: 600 }}>Drag & Drop multiple files or folders</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>We will auto-filter valid resume documents.</p>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button type="button" className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); batchInputRef.current.click(); }} style={{ fontSize: '0.8rem' }}>Add Files</button>
                    <button type="button" className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); folderInputRef.current.click(); }} style={{ fontSize: '0.8rem' }}>Add Folder</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {uploadMode === 'single' && (
            <>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>— OR —</div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Paste Resume Text Plainly</label>
                <textarea className="form-textarea" placeholder="Paste your resume contents here..." rows={6} value={resumeText} onChange={(e) => { setResumeText(e.target.value); if (file) setFile(null); }} />
              </div>
            </>
          )}

        </div>

        {/* Right Side: JD & Submit */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>2. Target Job Description (Optional for General Analysis)</h3>
          <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0 }}>
            <textarea className="form-textarea" placeholder="Paste the job advertisement to get an ATS Match Score. Leave blank for a general professional audit." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} style={{ flex: 1, minHeight: '200px', resize: 'vertical' }} />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={isBatchProcessing}>
            {isBatchProcessing ? '⏳ Processing Batch...' : '⚡ Run AI Audit'}
          </button>
        </div>
      </form>

      {/* Batch Processing Dashboard */}
      {uploadMode === 'batch' && batchQueue.length > 0 && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Batch Results ({batchQueue.filter(f => f.status === 'Completed').length} / {batchQueue.length})</h2>
            <button className="btn btn-outline" onClick={() => setBatchQueue([])} disabled={isBatchProcessing} style={{ fontSize: '0.8rem' }}>Clear Queue</button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>File Name</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Detected Profession</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Match Score</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {batchQueue.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{item.file.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem',
                        background: item.status === 'Pending' ? 'rgba(255,255,255,0.1)' :
                                    item.status === 'Analyzing' ? 'rgba(59, 130, 246, 0.2)' :
                                    item.status === 'Completed' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: item.status === 'Analyzing' ? '#60a5fa' :
                               item.status === 'Completed' ? '#4ade80' :
                               item.status === 'Failed' ? '#f87171' : 'white'
                      }}>{item.status}</span>
                      {item.errorMsg && <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem', maxWidth: '200px' }}>{item.errorMsg}</div>}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-secondary)' }}>
                      {item.data?.extractedProfile?.profession || item.data?.detectedDomain || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {item.data?.atsScore !== undefined ? (
                        <span className={`score-badge ${item.data.atsScore >= 75 ? 'score-high' : item.data.atsScore >= 50 ? 'score-medium' : 'score-low'}`} style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                          {item.data.atsScore}%
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {item.data && (
                        <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => onAnalysisComplete(item.data, jobDescription)}>
                          View Report
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
