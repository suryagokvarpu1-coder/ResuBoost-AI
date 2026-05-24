import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Rocket, BookOpen, Briefcase, Target, Check, ArrowRight,
  Upload, FileText, Sparkles, Zap, Play, Loader, CheckCircle,
  XCircle, RefreshCw, Terminal, Shield, Globe, Menu, X
} from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  // Navigation tabs in browser mockup
  const [mockActiveTab, setMockActiveTab] = useState('analyzer');
  
  // Simulated scanner states inside mockup
  const [scanState, setScanState] = useState('idle'); // 'idle', 'scanning', 'result'
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  const mockLoadingSteps = [
    'Parsing file contents...',
    'Analyzing resume structure...',
    'Extracting key skills & technologies...',
    'Matching against requirements...',
    'Generating scoring reports...'
  ];

  // Trigger simulated scan
  const startSimulatedScan = () => {
    setScanState('scanning');
    setScanProgress(0);
    setScanStepIndex(0);
  };

  useEffect(() => {
    let interval;
    if (scanState === 'scanning') {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setScanState('result'), 400);
            return 100;
          }
          const increment = Math.floor(Math.random() * 15) + 8;
          const next = Math.min(prev + increment, 100);
          
          // Increment loading steps based on progress
          const stepIndex = Math.min(
            Math.floor((next / 100) * mockLoadingSteps.length),
            mockLoadingSteps.length - 1
          );
          setScanStepIndex(stepIndex);
          
          return next;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [scanState]);

  return (
    <div className="landing-container">
      {/* Cinematic Spotlight and Light beam glow overlays */}
      <div className="cinematic-spotlight" />
      <div className="light-beam-container">
        <div className="light-beam-left" />
        <div className="light-beam-right" />
        <div className="light-beam-center" />
      </div>

      {/* Floating Center Navbar */}
      <header className="lp-header">
        <a href="/" className="lp-logo" onClick={(e) => { e.preventDefault(); }}>
          <div className="lp-logo-icon">
            <img src="/resuboost_logo.png" alt="ResuBoost" />
          </div>
          <span>ResuBoost AI</span>
        </a>

        <nav className="lp-navbar">
          <button className="lp-nav-link active" onClick={() => {
            const hero = document.getElementById('hero');
            hero?.scrollIntoView({ behavior: 'smooth' });
          }}>Home</button>
          <button className="lp-nav-link" onClick={() => {
            const features = document.getElementById('features');
            features?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>Features</button>
          <button className="lp-nav-link" onClick={() => {
            const howItWorks = document.getElementById('how-it-works');
            howItWorks?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>How it Works</button>
          <button className="lp-nav-link" onClick={() => {
            const pricing = document.getElementById('pricing');
            pricing?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>Pricing</button>
        </nav>

        <button className="lp-btn-try" onClick={onGetStarted}>
          <span>Try it Now</span>
          <ArrowRight size={14} />
        </button>
      </header>

      {/* Hero Section */}
      <section id="hero" className="lp-hero">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: '99px', marginBottom: '24px' }}
        >
          <Sparkles size={13} style={{ color: 'var(--color-secondary-light)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Next-Gen Career Optimization</span>
        </motion.div>

        <motion.h1
          className="lp-hero-title"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Smarter Careers Powered by an <span className="glow-text-gradient">Intelligent AI Assistant</span>
        </motion.h1>

        <motion.p
          className="lp-hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Upload your resume, optimize bullet points, scan against job requirements, and get instant recommendations to build a high-scoring ATS-proof profile.
        </motion.p>

        <motion.div
          className="lp-hero-ctas"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          <button className="lp-btn-outline-pill" onClick={() => {
            const features = document.getElementById('features');
            features?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>
            Explore Features
          </button>
          <button className="lp-btn-filled-pill" onClick={onGetStarted}>
            Get Started
          </button>
        </motion.div>
      </section>

      {/* Browser Mockup Wrapper */}
      <section className="lp-mockup-wrapper">
        <motion.div
          className="lp-browser-frame lp-glow-effect"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* macOS Browser Header */}
          <div className="lp-browser-header">
            <div className="lp-browser-dots">
              <span className="lp-dot lp-dot-red" />
              <span className="lp-dot lp-dot-yellow" />
              <span className="lp-dot lp-dot-green" />
            </div>
            <div className="lp-browser-search">
              <Globe size={11} />
              <span>resuboost.ai/analyzer</span>
            </div>
            <div className="lp-browser-actions">
              <span style={{ fontSize: '1.1rem', cursor: 'pointer', verticalAlign: 'middle' }}>+</span>
            </div>
          </div>

          {/* Browser Content Layout */}
          <div className="lp-browser-body">
            {/* Mock Sidebar */}
            <div className="lp-mockup-sidebar">
              <div className="lp-sidebar-menu">
                {/* Sidebar Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '0 4px' }}>
                  <div style={{ width: '20px', height: '20px', background: 'var(--gradient-primary)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5px', boxShadow: '0 2px 8px rgba(192, 132, 252, 0.2)' }}>
                    <img src="/resuboost_logo.png" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} alt="" />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>ResuBoost</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>+</span>
                </div>

                {/* Sidebar Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '6px 10px', marginBottom: '10px' }}>
                  <Search size={11} style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>Search</span>
                </div>

                <div
                  className={`lp-sidebar-item ${mockActiveTab === 'analyzer' ? 'active' : ''}`}
                  onClick={() => setMockActiveTab('analyzer')}
                >
                  <Sparkles size={13} style={{ color: 'var(--color-primary-light)' }} />
                  <span>AI Chatbot</span>
                  <span className="lp-sidebar-badge lp-sidebar-badge-active">Active</span>
                </div>
                <div
                  className={`lp-sidebar-item ${mockActiveTab === 'explore' ? 'active' : ''}`}
                  onClick={() => setMockActiveTab('explore')}
                >
                  <Search size={13} />
                  <span>Explore Shelby</span>
                </div>
                <div
                  className={`lp-sidebar-item ${mockActiveTab === 'application' ? 'active' : ''}`}
                  onClick={() => setMockActiveTab('application')}
                >
                  <Target size={13} />
                  <span>Application</span>
                </div>
                <div
                  className={`lp-sidebar-item ${mockActiveTab === 'project' ? 'active' : ''}`}
                  onClick={() => setMockActiveTab('project')}
                >
                  <Briefcase size={13} />
                  <span>Project</span>
                </div>
              </div>

              <div className="lp-sidebar-menu" style={{ marginTop: 'auto' }}>
                <span className="lp-sidebar-heading">Recent</span>
                <p className="lp-sidebar-recent" onClick={startSimulatedScan}>What is responsive web design...</p>
                <p className="lp-sidebar-recent" onClick={startSimulatedScan}>Explain UI grid systems in simpl...</p>
                <p className="lp-sidebar-recent" onClick={startSimulatedScan}>Best practices for SaaS dashbo...</p>
                <p className="lp-sidebar-recent" onClick={startSimulatedScan}>What is the difference between...</p>
              </div>
            </div>

            {/* Mock Main Panel */}
            <div className="lp-mockup-main">
              <AnimatePresence mode="wait">
                {scanState === 'idle' && (
                  <motion.div
                    key="idle"
                    className="lp-mockup-center"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Geometric Wireframe Cube Logo */}
                    <div className="lp-mockup-logo-box" style={{ width: '52px', height: '52px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#mockLogoGrad)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                        <defs>
                          <linearGradient id="mockLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-primary)" />
                            <stop offset="100%" stopColor="var(--color-secondary)" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    <h2 className="lp-mockup-heading" style={{ fontSize: '1.45rem', fontWeight: 800, maxWidth: '480px', lineHeight: '1.3', fontFamily: 'var(--font-sans)', letterSpacing: '-0.02em' }}>
                      Experience Smarter Conversations with an AI Assistant Built to Support Your Workflow
                    </h2>

                    <p className="lp-mockup-subtext" style={{ maxWidth: '420px', margin: '0 auto', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                      Ask questions, explore ideas, and get intelligent responses through a chatbot designed for speed, clarity, and productivity.
                    </p>

                    {/* Input Bar */}
                    <div className="lp-mockup-input-bar" onClick={startSimulatedScan} style={{ cursor: 'pointer', width: '100%', maxWidth: '450px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.35)' }}>Ask Something to ResuBoost</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8" />
                        </svg>
                        <div className="lp-mockup-btn-send">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 3 cards next to each other */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%', maxWidth: '450px', marginTop: '8px' }}>
                      <div className="lp-mockup-opt-card" onClick={startSimulatedScan} style={{ padding: '12px 8px', gap: '3px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '2px' }}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                        </svg>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>Upload Resume</span>
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.2 }}>Score ATS layout</span>
                      </div>
                      <div className="lp-mockup-opt-card" onClick={startSimulatedScan} style={{ padding: '12px 8px', gap: '3px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '2px' }}>
                          <circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24"/>
                        </svg>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>Optimize Bullets</span>
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.2 }}>Enhance actions</span>
                      </div>
                      <div className="lp-mockup-opt-card" onClick={startSimulatedScan} style={{ padding: '12px 8px', gap: '3px', borderRadius: '12px', background: 'rgba(255,255,255,0.015)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '2px' }}>
                          <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                        </svg>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>Career Roadmap</span>
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.2 }}>Map skill levels</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {scanState === 'scanning' && (
                  <motion.div
                    key="scanning"
                    className="lp-mock-progress-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="lp-mock-progress-header">
                      <span className="lp-mock-progress-title">Analyzing Sample Resume</span>
                      <span className="lp-mock-progress-percent">{scanProgress}%</span>
                    </div>

                    <div className="lp-mock-progress-bg">
                      <div className="lp-mock-progress-bar" style={{ width: `${scanProgress}%` }} />
                    </div>

                    <span className="lp-mock-progress-step flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
                      <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
                      {mockLoadingSteps[scanStepIndex]}
                    </span>
                  </motion.div>
                )}

                {scanState === 'result' && (
                  <motion.div
                    key="result"
                    className="lp-mock-report-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="lp-mock-report-row">
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#fff' }}>ATS Analysis Completed</h3>
                      <button className="lp-mock-report-reset-btn" onClick={() => setScanState('idle')}>
                        <RefreshCw size={11} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                        Scan Another
                      </button>
                    </div>

                    <div className="lp-mock-report-score-box">
                      <div className="lp-mock-score-ring">82%</div>
                      <div className="lp-mock-score-info">
                        <span className="lp-mock-score-title">Excellent Job Match</span>
                        <span className="lp-mock-score-badge">Highly Compatible with ATS screening filters</span>
                      </div>
                    </div>

                    <div className="flex-col gap-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
                      <div className="lp-mock-report-row">
                        <span className="lp-mock-report-label">Detected Job Profile:</span>
                        <span className="lp-mock-report-val">Senior Project Manager</span>
                      </div>
                      <div className="lp-mock-report-row">
                        <span className="lp-mock-report-label">Key Missing Skills:</span>
                        <span className="lp-mock-report-val" style={{ color: 'var(--color-secondary-light)' }}>Agile Scrum, Stakeholder Management</span>
                      </div>
                      <div className="lp-mock-report-row">
                        <span className="lp-mock-report-label">Readability Audit:</span>
                        <span className="lp-mock-report-val" style={{ color: '#10b981' }}>Pass (Single Column Layout)</span>
                      </div>
                    </div>

                    <button
                      className="lp-mock-report-action-btn"
                      onClick={onGetStarted}
                      style={{ marginTop: '4px' }}
                    >
                      <span>Boost Your Resume Score Now</span>
                      <ArrowRight size={13} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="lp-section">
        <h2 className="lp-section-title">
          Everything You Need to <span>Accelerate Your Career</span>
        </h2>
        <p className="lp-section-desc">
          Stop guessing why recruiters aren't replying. ResuBoost AI audits, suggestions, and career matching modules prepare you to convert.
        </p>

        <div className="lp-features-grid">
          <div className="lp-feature-card">
            <div className="lp-feat-icon-wrapper">
              <Search size={20} />
            </div>
            <h3 className="lp-feat-title">ATS Match Analyzer</h3>
            <p className="lp-feat-desc">
              Cross-reference your resume layout, headings, and formatting against active parsing standards to maximize screening rates.
            </p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feat-icon-wrapper">
              <Target size={20} />
            </div>
            <h3 className="lp-feat-title">Bullet Points Optimizer</h3>
            <p className="lp-feat-desc">
              Upgrade bullet experience texts. Infuse action verbs, align structure with XYZ formulas, and embed key numeric impact details.
            </p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feat-icon-wrapper">
              <Rocket size={20} />
            </div>
            <h3 className="lp-feat-title">Personalized Career Hub</h3>
            <p className="lp-feat-desc">
              Discover suitable jobs matching your analyzed skill clusters. Calculate compatibility odds and receive structural career path fits.
            </p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feat-icon-wrapper">
              <BookOpen size={20} />
            </div>
            <h3 className="lp-feat-title">Skill Gap Pathways</h3>
            <p className="lp-feat-desc">
              Calculate tags required for targeted job specs. Let our system generate modular course pathways to close knowledge gaps.
            </p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feat-icon-wrapper">
              <Zap size={20} />
            </div>
            <h3 className="lp-feat-title">Keyword Recommendations</h3>
            <p className="lp-feat-desc">
              Identify core industry terminology, software tool sets, and certifications omitted from your profile but requested in target JDs.
            </p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feat-icon-wrapper">
              <Shield size={20} />
            </div>
            <h3 className="lp-feat-title">Secure & Confidential</h3>
            <p className="lp-feat-desc">
              Your resume files, contact details, and career information are encrypted. We never share your data with public scraper catalogs.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="lp-section" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
        <h2 className="lp-section-title">
          How <span>ResuBoost AI</span> Works
        </h2>
        <p className="lp-section-desc">
          Get optimized in minutes with our simple, data-driven optimization pipeline.
        </p>

        <div className="lp-timeline">
          <div className="lp-timeline-step">
            <div className="lp-timeline-num">1</div>
            <h3 className="lp-timeline-title">Upload Profile</h3>
            <p className="lp-timeline-desc">
              Upload your existing resume in PDF/DOCX or paste text directly. Paste target JDs if you're matching roles.
            </p>
          </div>
          <div className="lp-timeline-step">
            <div className="lp-timeline-num">2</div>
            <h3 className="lp-timeline-title">AI Deep Audit</h3>
            <p className="lp-timeline-desc">
              Our engines parse structure, readability index, keyword frequency, and experience metrics to produce matching grades.
            </p>
          </div>
          <div className="lp-timeline-step">
            <div className="lp-timeline-num">3</div>
            <h3 className="lp-timeline-title">Optimize & Apply</h3>
            <p className="lp-timeline-desc">
              Follow suggestions, edit bullets with real-time feedback, and export ready files to send to recruiters.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="lp-section">
        <h2 className="lp-section-title">
          Simple, Transparent <span>Pricing Plans</span>
        </h2>
        <p className="lp-section-desc">
          Choose a plan that fits your career aspirations. Cancel or modify subscription tiers anytime.
        </p>

        <div className="lp-pricing-grid">
          {/* Card 1 */}
          <div className="lp-pricing-card">
            <span className="lp-price-tier">Starter</span>
            <div className="lp-price-val">$0 <span>/ mo</span></div>
            <p className="lp-price-desc">Perfect for a quick scan and baseline assessment.</p>
            <div className="lp-pricing-features">
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>3 Full Resume Scans</span>
              </div>
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>General ATS Scoring Card</span>
              </div>
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Key Missing Tag Alerts</span>
              </div>
              <div className="lp-pricing-feat-item disabled">
                <X size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
                <span>AI Experience Bullet Points Optimizer</span>
              </div>
              <div className="lp-pricing-feat-item disabled">
                <X size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
                <span>Career Paths Fit Calculations</span>
              </div>
            </div>
            <button className="lp-pricing-btn lp-pricing-btn-outline" onClick={onGetStarted}>
              Sign Up Free
            </button>
          </div>

          {/* Card 2 */}
          <div className="lp-pricing-card popular">
            <span className="lp-price-tier" style={{ color: 'var(--color-primary-light)' }}>Pro Career Boost</span>
            <div className="lp-price-val">$19 <span>/ mo</span></div>
            <p className="lp-price-desc">Our most popular plan to rewrite resumes and land interviews.</p>
            <div className="lp-pricing-features">
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Unlimited Resume & Job Match Scans</span>
              </div>
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Complete ATS Layout Audit</span>
              </div>
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Unlimited Bullet Optimizer Queries</span>
              </div>
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Custom Skill Course Pathway recommendations</span>
              </div>
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Priority AI Speeds</span>
              </div>
            </div>
            <button className="lp-pricing-btn lp-pricing-btn-filled" onClick={onGetStarted}>
              Go Pro Now
            </button>
          </div>

          {/* Card 3 */}
          <div className="lp-pricing-card">
            <span className="lp-price-tier">Professional Batch</span>
            <div className="lp-price-val">$49 <span>/ mo</span></div>
            <p className="lp-price-desc">For recruitment agents and corporate career coaches.</p>
            <div className="lp-pricing-features">
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Unlimited Resume Scans</span>
              </div>
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Batch Upload & Folder Parsing</span>
              </div>
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Unified Recruiter Scoring Table</span>
              </div>
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Dedicated API Key Support</span>
              </div>
              <div className="lp-pricing-feat-item">
                <Check size={14} style={{ color: '#10b981' }} />
                <span>Dedicated Account Manager</span>
              </div>
            </div>
            <button className="lp-pricing-btn lp-pricing-btn-outline" onClick={onGetStarted}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="lp-footer">
        <div className="lp-footer-content">
          <div className="lp-footer-brand">
            <a href="/" className="lp-logo" onClick={(e) => { e.preventDefault(); }}>
              <div className="lp-logo-icon">
                <img src="/resuboost_logo.png" alt="ResuBoost" />
              </div>
              <span>ResuBoost AI</span>
            </a>
            <p className="lp-footer-brand-desc">
              AI-driven career development tools to help engineers, managers, and designers maximize recruiter match compatibility.
            </p>
          </div>

          <div className="lp-footer-col">
            <span className="lp-footer-col-title">Platform</span>
            <div className="lp-footer-links">
              <a href="#features" className="lp-footer-link">Features</a>
              <a href="#pricing" className="lp-footer-link">Pricing</a>
              <a href="/" className="lp-footer-link" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Dashboard</a>
              <a href="/" className="lp-footer-link" onClick={(e) => { e.preventDefault(); }}>Security</a>
            </div>
          </div>

          <div className="lp-footer-col">
            <span className="lp-footer-col-title">Company</span>
            <div className="lp-footer-links">
              <a href="/" className="lp-footer-link" onClick={(e) => { e.preventDefault(); }}>About Us</a>
              <a href="/" className="lp-footer-link" onClick={(e) => { e.preventDefault(); }}>Careers</a>
              <a href="/" className="lp-footer-link" onClick={(e) => { e.preventDefault(); }}>Blog</a>
              <a href="/" className="lp-footer-link" onClick={(e) => { e.preventDefault(); }}>Contact</a>
            </div>
          </div>

          <div className="lp-footer-col">
            <span className="lp-footer-col-title">Legal</span>
            <div className="lp-footer-links">
              <a href="/" className="lp-footer-link" onClick={(e) => { e.preventDefault(); }}>Privacy Policy</a>
              <a href="/" className="lp-footer-link" onClick={(e) => { e.preventDefault(); }}>Terms of Service</a>
              <a href="/" className="lp-footer-link" onClick={(e) => { e.preventDefault(); }}>Cookie Settings</a>
            </div>
          </div>
        </div>

        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} ResuBoost AI. All rights reserved.</span>
          <span>Designed for modern career workflows.</span>
        </div>
      </footer>
    </div>
  );
}
