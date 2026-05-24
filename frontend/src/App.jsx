import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Rocket, BookOpen, Briefcase, BarChart3,
  Key, GraduationCap, Target, User, Sparkles, Zap, X
} from 'lucide-react';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import Dashboard from './components/Dashboard';
import KeywordSuggestions from './components/KeywordSuggestions';
import BulletOptimizer from './components/BulletOptimizer';
import EmployabilityAudit from './components/EmployabilityAudit';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import AuthScreen from './components/AuthScreen';
import Profile from './components/Profile';
import CareerHub from './components/CareerHub';
import LearningHub from './components/LearningHub';
import OpportunityHub from './components/OpportunityHub';
import LandingPage from './components/LandingPage';

// Animation variants
const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.25 } }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
};

const navItems = [
  { key: 'analyzer', label: 'Analyzer', icon: Search },
  { key: 'career', label: 'Career Hub', icon: Rocket },
  { key: 'learning', label: 'Learning', icon: BookOpen },
  { key: 'opportunities', label: 'Opportunities', icon: Briefcase },
];

const resultNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { key: 'keywords', label: 'Keywords', icon: Key },
  { key: 'employability', label: 'Audit', icon: GraduationCap },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [lastJd, setLastJd] = useState('');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [splashLoading, setSplashLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Track Firebase Authentication State & Realtime Database sync
  useEffect(() => {
    let dbUnsubscribe = null;
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (dbUnsubscribe) {
        dbUnsubscribe();
        dbUnsubscribe = null;
      }

      if (currentUser) {
        const userDbRef = ref(db, `users/${currentUser.uid}`);
        dbUnsubscribe = onValue(userDbRef, (snapshot) => {
          const dbData = snapshot.val() || {};

          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: dbData.displayName || currentUser.displayName || '',
            photoURL: dbData.photoURL || currentUser.photoURL || '👨',
            emailVerified: currentUser.emailVerified,
            metadata: currentUser.metadata,
            preferences: dbData.preferences || {},
            apiKey: dbData.apiKey || ''
          });

          if (dbData.preferences?.theme) {
            localStorage.setItem('resuboost_theme', dbData.preferences.theme);
            document.documentElement.setAttribute('data-theme', dbData.preferences.theme);
          }

          if (dbData.apiKey && typeof dbData.apiKey === 'string' && dbData.apiKey.trim() !== '') {
            localStorage.setItem('gemini_api_key', dbData.apiKey);
            setApiKey(dbData.apiKey);
          }

          setAuthLoading(false);
        }, (error) => {
          console.error("Database sync error:", error);
          setUser(currentUser);
          setAuthLoading(false);
        });
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (dbUnsubscribe) dbUnsubscribe();
    };
  }, []);

  // Simulated Splash Progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setSplashLoading(false), 400);
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 6;
        return Math.min(prev + step, 100);
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('resuboost_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const getLoadingMessage = (val) => {
    if (val < 20) return "Initializing AI engines...";
    if (val < 40) return "Loading ATS analysis modules...";
    if (val < 60) return "Configuring resume rubrics...";
    if (val < 80) return "Establishing secure connection...";
    if (val < 95) return "Preparing your workspace...";
    return "Launching platform...";
  };

  const triggerUserRefresh = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        setUser((prevUser) => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            displayName: auth.currentUser.displayName || prevUser.displayName,
            photoURL: auth.currentUser.photoURL || prevUser.photoURL,
            emailVerified: auth.currentUser.emailVerified,
            metadata: auth.currentUser.metadata
          };
        });
      } catch (err) {
        console.error("Failed to reload user:", err);
      }
    }
  };

  const handleAnalysisComplete = (result, jd) => {
    setAnalysisResult(result);
    if (jd) setLastJd(jd);
    setActiveTab('dashboard');
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setActiveTab('analyzer');
  };

  const handleApiKeyUpdate = (newKey) => {
    setApiKey(newKey);
    if (analysisResult && !analysisResult.isAI) {
      setAnalysisResult(null);
    }
  };

  // ═══════════════════════════════════════════════
  // SPLASH SCREEN
  // ═══════════════════════════════════════════════
  if (splashLoading || authLoading) {
    return (
      <div className="app-container flex-center" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div className="cinematic-spotlight" />

        <motion.div
          className="glass-card glass-card-static"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding: '3.5rem 3rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-8)',
            maxWidth: '460px',
            width: '90%',
          }}
        >
          {/* Animated Logo */}
          <div style={{ position: 'relative' }}>
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', inset: '-18px',
                borderRadius: 'var(--radius-lg)',
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
                filter: 'blur(12px)',
              }}
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '88px', height: '88px',
                background: 'var(--gradient-primary)',
                borderRadius: '22px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 12px 35px rgba(255, 255, 255, 0.08)',
                padding: '3px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 2,
              }}
            >
              <img src="/resuboost_logo.png" alt="ResuBoost" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
            </motion.div>
          </div>

          {/* Title */}
          <div>
            <h1 className="glow-text-gradient" style={{ fontSize: '2.25rem', letterSpacing: '-0.03em' }}>
              ResuBoost AI
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 'var(--space-2)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              AI-Powered Career Platform
            </motion.p>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {getLoadingMessage(progress)}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {progress}%
              </span>
            </div>
            <div style={{
              width: '100%', height: '10px',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              padding: '2px',
              overflow: 'hidden',
            }}>
              <motion.div
                style={{
                  height: '100%',
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-full)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }} />
              </motion.div>
            </div>
          </div>

          {/* Status Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex-center gap-4"
            style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: 'var(--space-5)',
              width: '100%',
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.05em',
            }}
          >
            <span className="flex-center gap-2">
              <span className="status-dot status-dot-success" style={{ width: 6, height: 6 }} />
              SECURE
            </span>
            <span>•</span>
            <span>AI ENGINE READY</span>
            <span>•</span>
            <span className="flex-center gap-2">
              <Zap size={10} />
              v2.0
            </span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // LANDING PAGE & AUTH MODAL
  // ═══════════════════════════════════════════════
  if (!user) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowAuthModal(true)} />

        <AnimatePresence>
          {showAuthModal && (
            <motion.div
              className="auth-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'relative', width: '100%', maxWidth: '440px', margin: '2rem auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="auth-modal-close"
                  onClick={() => setShowAuthModal(false)}
                  aria-label="Close modal"
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 2005
                  }}
                >
                  <X size={18} />
                </button>
                <AuthScreen />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ═══════════════════════════════════════════════
  // MAIN APP
  // ═══════════════════════════════════════════════
  return (
    <div className="app-container">

      {/* ── NAVBAR ── */}
      <header className="navbar">
        <a href="/" className="logo" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
          <div className="logo-icon">
            <img src="/resuboost_logo.png" alt="ResuBoost" />
          </div>
          <span className="glow-text-gradient" style={{ fontSize: '1.25rem' }}>ResuBoost</span>
        </a>

        <nav className="nav-links">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-link ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={15} className="nav-icon" />
              <span>{label}</span>
              {activeTab === key && (
                <motion.div
                  layoutId="activeTabIndicator"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '15%',
                    right: '15%',
                    height: '2px',
                    background: '#fff',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
                  }}
                />
              )}
            </button>
          ))}

          {analysisResult && resultNavItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-link ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={15} className="nav-icon" />
              <span>{label}</span>
              {activeTab === key && (
                <motion.div
                  layoutId="activeTabIndicator"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '15%',
                    right: '15%',
                    height: '2px',
                    background: '#fff',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
                  }}
                />
              )}
            </button>
          ))}

          <button
            className={`nav-link ${activeTab === 'optimizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('optimizer')}
          >
            <Target size={15} className="nav-icon" />
            <span>Optimizer</span>
            {activeTab === 'optimizer' && (
              <motion.div
                layoutId="activeTabIndicator"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '15%',
                  right: '15%',
                  height: '2px',
                  background: '#fff',
                  borderRadius: '2px',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
                }}
              />
            )}
          </button>
        </nav>

        {/* Profile Avatar */}
        <motion.button
          onClick={() => setActiveTab('profile')}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px',
            background: activeTab === 'profile'
              ? 'var(--gradient-primary)'
              : 'var(--bg-input)',
            border: activeTab === 'profile'
              ? '2px solid var(--color-primary)'
              : '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            boxShadow: activeTab === 'profile'
              ? '0 0 15px rgba(59, 130, 246, 0.3)'
              : 'var(--shadow-clay-sm)',
            padding: 0,
            overflow: 'hidden',
            flexShrink: 0,
          }}
          title="Profile"
        >
          {user.photoURL ? (
            user.photoURL.length <= 2 ? (
              <span style={{ fontSize: '1.15rem' }}>{user.photoURL}</span>
            ) : (
              <img
                src={user.photoURL}
                alt="Profile"
                style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }}
              />
            )
          ) : (
            <User size={18} style={{ color: 'var(--text-muted)' }} />
          )}
        </motion.button>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {activeTab === 'analyzer' && (
            <motion.div key="analyzer" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <ResumeAnalyzer apiKey={apiKey} onAnalysisComplete={handleAnalysisComplete} />
            </motion.div>
          )}

          {activeTab === 'dashboard' && analysisResult && (
            <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Dashboard data={analysisResult} onReset={handleReset} />
            </motion.div>
          )}

          {activeTab === 'keywords' && analysisResult && (
            <motion.div key="keywords" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <KeywordSuggestions data={analysisResult} />
            </motion.div>
          )}

          {activeTab === 'employability' && analysisResult && (
            <motion.div key="employability" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <EmployabilityAudit data={analysisResult} />
            </motion.div>
          )}

          {activeTab === 'optimizer' && (
            <motion.div key="optimizer" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <BulletOptimizer apiKey={apiKey} defaultJd={lastJd} />
            </motion.div>
          )}

          {activeTab === 'career' && (
            <motion.div key="career" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <CareerHub user={user} apiKey={apiKey} analysisResult={analysisResult} />
            </motion.div>
          )}

          {activeTab === 'learning' && (
            <motion.div key="learning" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <LearningHub user={user} apiKey={apiKey} analysisResult={analysisResult} />
            </motion.div>
          )}

          {activeTab === 'opportunities' && (
            <motion.div key="opportunities" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <OpportunityHub user={user} apiKey={apiKey} analysisResult={analysisResult} />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <Profile
                key={user.uid}
                user={user}
                apiKey={apiKey}
                setApiKey={handleApiKeyUpdate}
                onProfileUpdate={triggerUserRefresh}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── FOOTER ── */}
      <footer className="app-footer">
        <div className="flex-center gap-6" style={{ marginBottom: 'var(--space-2)' }}>
          <span className="flex-center gap-2">
            <Sparkles size={12} />
            AI-Powered
          </span>
          <span>•</span>
          <span>ATS Optimized</span>
          <span>•</span>
          <span className="flex-center gap-2">
            <Zap size={12} />
            Real-time Analysis
          </span>
        </div>
        <p>© {new Date().getFullYear()} ResuBoost AI. Crafted for excellence.</p>
      </footer>
    </div>
  );
}
