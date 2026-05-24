import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Clipboard, Trash2, Play, AlertTriangle,
  CheckCircle, XCircle, Loader, FolderOpen, Sparkles, Brain,
  BarChart3, FileSearch, Zap, X, ArrowRight, Briefcase
} from 'lucide-react';

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

const loadingSteps = [
  { icon: FileSearch, text: 'Parsing file contents...' },
  { icon: Brain, text: 'Analyzing resume structure...' },
  { icon: Sparkles, text: 'Extracting key skills & technologies...' },
  { icon: BarChart3, text: 'Matching against job requirements...' },
  { icon: Zap, text: 'Connecting to AI engine...' },
  { icon: CheckCircle, text: 'Generating scoring reports...' },
];

export default function ResumeAnalyzer({ apiKey, onAnalysisComplete }) {
  const [uploadMode, setUploadMode] = useState('single');

  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [batchQueue, setBatchQueue] = useState([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const batchInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];

  const isFileValid = (f) => allowedTypes.includes(f.type) ||
    f.name.endsWith('.pdf') || f.name.endsWith('.docx') || f.name.endsWith('.doc') || f.name.endsWith('.txt');

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };

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
          file: f, status: 'Pending', data: null, errorMsg: ''
        }));
        if (newFiles.length === 0) setError('No valid resume files found in drop.');
        else setBatchQueue(prev => [...prev, ...newFiles]);
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

  const processResumeAPI = async (activeFile, activeText, jd) => {
    const formData = new FormData();
    if (activeFile) formData.append('resume', activeFile);
    else formData.append('resumeText', activeText);
    formData.append('jobDescription', jd);
    const headers = {};
    if (apiKey) headers['x-api-key'] = apiKey;
    const response = await fetch('/api/analyze', { method: 'POST', headers, body: formData });
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
    const interval = setInterval(() => setLoadingStep((prev) => (prev + 1) % loadingSteps.length), 1500);
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
      setBatchQueue(prev => { const q = [...prev]; q[i].status = 'Analyzing'; return q; });
      try {
        const data = await processResumeAPI(batchQueue[i].file, '', jobDescription);
        setBatchQueue(prev => { const q = [...prev]; q[i].status = 'Completed'; q[i].data = data; return q; });
      } catch (err) {
        setBatchQueue(prev => { const q = [...prev]; q[i].status = 'Failed'; q[i].errorMsg = err.message; return q; });
      }
    }
    setIsBatchProcessing(false);
  };

  // ── LOADING STATE ──
  if (loading && uploadMode === 'single') {
    const CurrentIcon = loadingSteps[loadingStep].icon;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card glass-card-static text-center"
        style={{ padding: 'var(--space-16) var(--space-8)', maxWidth: '550px', margin: '3rem auto' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--color-primary)',
            margin: '0 auto var(--space-6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <CurrentIcon size={28} style={{ color: 'var(--color-primary)' }} />
          </motion.div>
        </motion.div>

        <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-4)' }}>Analyzing Resume</h3>

        <AnimatePresence mode="wait">
          <motion.p
            key={loadingStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glow-text-primary"
            style={{ fontSize: '1rem', fontWeight: 600 }}
          >
            {loadingSteps[loadingStep].text}
          </motion.p>
        </AnimatePresence>

        {/* Step indicators */}
        <div className="flex-center gap-2" style={{ marginTop: 'var(--space-6)' }}>
          {loadingSteps.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                background: i === loadingStep ? 'var(--color-primary)' : i < loadingStep ? 'var(--color-success)' : 'var(--border-color)',
                scale: i === loadingStep ? 1.3 : 1,
              }}
              style={{ width: 8, height: 8, borderRadius: '50%' }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // ── MAIN UI ──
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-col gap-8"
    >
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '2.25rem', marginBottom: 'var(--space-3)' }}
        >
          AI <span className="glow-text-gradient">Resume Analyzer</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}
        >
          Upload your resume for instant ATS scoring, AI-driven insights, and professional analysis.
        </motion.p>

        {/* Mode Toggle */}
        <div className="flex-center gap-3" style={{ marginTop: 'var(--space-6)' }}>
          <motion.button
            className={`btn ${uploadMode === 'single' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setUploadMode('single')}
            disabled={isBatchProcessing}
            whileTap={{ scale: 0.97 }}
          >
            <FileText size={16} /> Single Resume
          </motion.button>
          <motion.button
            className={`btn ${uploadMode === 'batch' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setUploadMode('batch')}
            disabled={isBatchProcessing}
            whileTap={{ scale: 0.97 }}
          >
            <FolderOpen size={16} /> Batch Upload
          </motion.button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="badge badge-danger"
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)', width: '100%',
              fontSize: '0.85rem', textTransform: 'none', letterSpacing: 0,
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{error}</span>
            <button className="btn-ghost" onClick={() => setError('')} style={{ padding: '2px' }}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form */}
      <form onSubmit={(e) => { e.preventDefault(); uploadMode === 'single' ? triggerSingleAnalysis() : triggerBatchAnalysis(); }} className="grid-2">
        {/* Left: Upload */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card glass-card-static flex-col gap-5"
        >
          <div className="flex-between">
            <h3 style={{ fontSize: '1.15rem' }}>
              <span className="flex-center gap-2">
                <Upload size={18} style={{ color: 'var(--color-primary)' }} />
                Upload Resume
              </span>
            </h3>
            {uploadMode === 'single' && (
              <button type="button" className="btn btn-outline btn-sm" onClick={loadPreset}>
                <Sparkles size={13} /> Sample
              </button>
            )}
          </div>

          {/* Drop Zone */}
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => uploadMode === 'single' ? fileInputRef.current.click() : batchInputRef.current.click()}
            whileHover={{ borderColor: 'var(--color-primary)', background: 'rgba(59, 130, 246, 0.04)' }}
            style={{
              border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.12)'}`,
              background: isDragging ? 'rgba(59, 130, 246, 0.06)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-10) var(--space-6)',
              textAlign: 'center', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {uploadMode === 'single' ? (
              <>
                <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files[0] && isFileValid(e.target.files[0])) { setFile(e.target.files[0]); setResumeText(''); } }} accept=".pdf,.docx,.doc,.txt" style={{ display: 'none' }} />
                {file ? (
                  <div className="flex-col gap-2" style={{ alignItems: 'center' }}>
                    <FileText size={36} style={{ color: 'var(--color-success)' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</p>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(1)} KB</span>
                    <button
                      type="button" className="btn btn-outline btn-sm"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      style={{ marginTop: 'var(--space-2)' }}
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex-col gap-2" style={{ alignItems: 'center' }}>
                    <Upload size={36} style={{ color: 'var(--text-muted)' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Drag & drop file, or click to browse</p>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Supports PDF, DOCX, DOC, TXT (max 5MB)</span>
                  </div>
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
                <div className="flex-col gap-3" style={{ alignItems: 'center' }}>
                  <FolderOpen size={36} style={{ color: 'var(--text-muted)' }} />
                  <p style={{ fontWeight: 600 }}>Drag & drop multiple files or folders</p>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Auto-filters valid resume documents</span>
                  <div className="flex-center gap-3" style={{ marginTop: 'var(--space-2)' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); batchInputRef.current.click(); }}>
                      <FileText size={13} /> Add Files
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={(e) => { e.stopPropagation(); folderInputRef.current.click(); }}>
                      <FolderOpen size={13} /> Add Folder
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Paste Area (single mode) */}
          {uploadMode === 'single' && (
            <>
              <div className="flex-center gap-3">
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>or paste text</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <div className="flex-between mb-2">
                  <label className="form-label" style={{ margin: 0 }}>
                    <Clipboard size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />
                    Resume Text
                  </label>
                  {resumeText && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{resumeText.length} chars</span>
                  )}
                </div>
                <textarea
                  className="form-textarea"
                  placeholder="Paste your resume contents here..."
                  rows={5}
                  value={resumeText}
                  onChange={(e) => { setResumeText(e.target.value); if (file) setFile(null); }}
                />
              </div>
            </>
          )}
        </motion.div>

        {/* Right: JD & Submit */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card glass-card-static flex-col gap-5"
        >
          <h3 style={{ fontSize: '1.15rem' }}>
            <span className="flex-center gap-2">
              <Briefcase size={18} style={{ color: 'var(--color-secondary)' }} />
              Job Description
            </span>
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)', marginTop: '-0.5rem' }}>
            Optional — paste a JD for targeted ATS match scoring
          </p>
          <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0 }}>
            <textarea
              className="form-textarea"
              placeholder="Paste the job description for targeted ATS analysis. Leave blank for a general audit."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{ flex: 1, minHeight: '200px' }}
            />
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary w-full"
            style={{ padding: '1rem' }}
            disabled={isBatchProcessing}
            whileTap={{ scale: 0.98 }}
          >
            {isBatchProcessing ? (
              <span className="flex-center gap-2"><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing Batch...</span>
            ) : (
              <span className="flex-center gap-2"><Zap size={16} /> Run AI Analysis <ArrowRight size={16} /></span>
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Batch Results */}
      <AnimatePresence>
        {uploadMode === 'batch' && batchQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-panel"
            style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-md)', background: 'rgba(10, 11, 16, 0.4)' }}
          >
            <div className="flex-between mb-6">
              <h2 style={{ fontSize: '1.2rem', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
                Batch Results ({batchQueue.filter(f => f.status === 'Completed').length} / {batchQueue.length})
              </h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setBatchQueue([])} disabled={isBatchProcessing}>
                <Trash2 size={13} /> Clear
              </button>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(5, 6, 9, 0.3)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                    {['File Name', 'Status', 'Profession', 'Score', 'Action'].map(h => (
                      <th key={h} style={{ padding: '1rem var(--space-4)', fontWeight: 700, fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {batchQueue.map((item, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '1rem var(--space-4)', fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>
                        <span className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                          <FileText size={14} style={{ color: 'var(--color-primary-light)', flexShrink: 0 }} />
                          {item.file.name}
                        </span>
                      </td>
                      <td style={{ padding: '1rem var(--space-4)' }}>
                        <span className={`badge ${item.status === 'Completed' ? 'badge-success' : item.status === 'Failed' ? 'badge-danger' : item.status === 'Analyzing' ? 'badge-info' : 'badge-accent'}`} style={{ fontSize: '0.68rem', padding: '0.2rem 0.6rem' }}>
                          {item.status === 'Analyzing' && <Loader size={11} style={{ animation: 'spin 1s linear infinite', marginRight: '4px' }} />}
                          {item.status === 'Completed' && <CheckCircle size={11} style={{ marginRight: '4px' }} />}
                          {item.status === 'Failed' && <XCircle size={11} style={{ marginRight: '4px' }} />}
                          {item.status}
                        </span>
                        {item.errorMsg && <div className="text-xs" style={{ color: 'var(--color-danger)', marginTop: '4px', maxWidth: '200px' }}>{item.errorMsg}</div>}
                      </td>
                      <td style={{ padding: '1rem var(--space-4)', color: 'var(--color-secondary-light)', fontSize: '0.85rem', fontWeight: 550 }}>
                        {item.data?.extractedProfile?.profession || item.data?.detectedDomain || '—'}
                      </td>
                      <td style={{ padding: '1rem var(--space-4)' }}>
                        {item.data?.atsScore !== undefined ? (
                          <span className={`badge ${item.data.atsScore >= 75 ? 'badge-success' : item.data.atsScore >= 50 ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}>
                            {item.data.atsScore}%
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '1rem var(--space-4)' }}>
                        {item.data && (
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => onAnalysisComplete(item.data, jobDescription)}>
                            <BarChart3 size={13} /> View
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
