import { useState, useEffect } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [lastJd, setLastJd] = useState('');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [splashLoading, setSplashLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Track Firebase Authentication State & Realtime Database sync
  useEffect(() => {
    let dbUnsubscribe = null;
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Clean up previous database listener if any
      if (dbUnsubscribe) {
        dbUnsubscribe();
        dbUnsubscribe = null;
      }

      if (currentUser) {
        // Set up real-time listener for the user record
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

          // Sync theme preference automatically
          if (dbData.preferences?.theme) {
            localStorage.setItem('resuboost_theme', dbData.preferences.theme);
            document.documentElement.setAttribute('data-theme', dbData.preferences.theme);
          }
          
          // Sync API Key automatically
          if (dbData.apiKey !== undefined) {
            localStorage.setItem('gemini_api_key', dbData.apiKey);
            setApiKey(dbData.apiKey);
          }
          
          setAuthLoading(false);
        }, (error) => {
          console.error("Database sync error:", error);
          // Fallback if permission denied
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

  // Simulated Splash Progress Bar Loader
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setSplashLoading(false);
          }, 300);
          return 100;
        }
        const step = Math.floor(Math.random() * 12) + 6;
        const next = prev + step;
        return next > 100 ? 100 : next;
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  const getLoadingMessage = (val) => {
    if (val < 25) return "Initializing core sandbox...";
    if (val < 50) return "Loading neural ATS engines...";
    if (val < 75) return "Configuring resume rubrics...";
    if (val < 95) return "Establishing auth gateways...";
    return "Launching platform...";
  };

  // Initialize theme from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('resuboost_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

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
    if (jd) {
      setLastJd(jd);
    }
    setActiveTab('dashboard');
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setActiveTab('analyzer');
  };

  if (splashLoading || authLoading) {
    return (
      <div className="app-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'var(--bg-base)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glowing Background Ambient Lights */}
        <div className="ambient-orb orb-blue" style={{ width: '600px', height: '600px', opacity: 0.6 }}></div>
        <div className="ambient-orb orb-pink" style={{ width: '600px', height: '600px', opacity: 0.4 }}></div>

        {/* 3D Glassmorphic Card Container */}
        <div className="glass-card animate-slide-up" style={{ 
          padding: '3.5rem 3rem', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '2rem', 
          maxWidth: '480px',
          width: '90%',
          boxShadow: 'var(--shadow-clay)',
          borderRadius: 'var(--radius-lg)'
        }}>
          {/* Logo with pulsating neon ring */}
          <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '-15px',
              right: '-15px',
              bottom: '-15px',
              borderRadius: '24px',
              background: 'radial-gradient(circle, rgba(217, 70, 239, 0.4) 0%, transparent 70%)',
              filter: 'blur(10px)',
              animation: 'pulseGlow 2.5s ease-in-out infinite'
            }} />
            
            <div style={{
              width: '90px',
              height: '90px',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              borderRadius: '22px',
              boxShadow: '0 12px 35px rgba(217, 70, 239, 0.4)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'floatLogo 3s ease-in-out infinite',
              position: 'relative',
              zIndex: 2
            }}>
              <img src="/resuboost_logo.png" alt="ResuBoost Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="glow-text-gradient" style={{ 
              fontSize: '2.5rem', 
              fontWeight: 900, 
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1 
            }}>
              ResuBoost AI
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.95rem', 
              marginTop: '0.5rem',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Initializing Platform
            </p>
          </div>

          {/* Simulated loading bar with neon glow */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '0.8rem', 
              color: 'var(--text-muted)',
              fontWeight: 700,
              fontFamily: 'monospace'
            }}>
              <span>{getLoadingMessage(progress)}</span>
              <span style={{ color: 'var(--color-secondary)' }}>{progress}%</span>
            </div>

            {/* Glassmorphic progress track */}
            <div style={{
              width: '100%',
              height: '14px',
              background: 'rgba(8, 12, 24, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 'var(--radius-full)',
              padding: '2px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Highlight gradient fill */}
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.15s cubic-bezier(0.1, 0.8, 0.2, 1)',
                position: 'relative',
                boxShadow: '0 0 10px rgba(217, 70, 239, 0.5)'
              }}>
                {/* Moving flare effect */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)',
                  animation: 'shimmer 1.5s infinite',
                  backgroundSize: '200% 100%'
                }} />
              </div>
            </div>
          </div>

          {/* Bottom active tech stats for visually premium look */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.25rem',
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            fontFamily: 'monospace'
          }}>
            <span>HOST: localhost:5000</span>
            <span>•</span>
            <span>SSL: SECURE HANDSHAKE</span>
            <span>•</span>
            <span>SYS: ACTIVE</span>
          </div>

          {/* Inline animations styling */}
          <style>{`
            @keyframes pulseGlow {
              0% { transform: scale(0.9); opacity: 0.5; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(0.9); opacity: 0.5; }
            }
            @keyframes floatLogo {
              0% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-8px) rotate(2deg); }
              100% { transform: translateY(0px) rotate(0deg); }
            }
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="ambient-orb orb-blue"></div>
        <div className="ambient-orb orb-pink"></div>
        <header className="navbar" style={{ justifyContent: 'center' }}>
          <div className="logo">
            <div className="logo-icon">
              <img src="/resuboost_logo.png" alt="ResuBoost Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
            </div>
          </div>
        </header>
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AuthScreen />
        </main>
        <footer style={{ 
          textAlign: 'center', 
          padding: '2rem 1.5rem', 
          marginTop: 'auto', 
          borderTop: '1px solid var(--border-color)',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <p>© {new Date().getFullYear()} ResuBoost AI. All rights reserved. Crafted for visual excellence & premium ATS parsing.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Ambient background 3D floating layers */}
      <div className="ambient-orb orb-blue"></div>
      <div className="ambient-orb orb-pink"></div>

      {/* Navigation Header */}
      <header className="navbar">
        <a href="/" className="logo" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>
          <div className="logo-icon">
            <img src="/resuboost_logo.png" alt="ResuBoost Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
          </div>
        </a>

        <nav className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'analyzer' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            🔍 Analyzer
          </button>

          <button 
            className={`nav-link ${activeTab === 'career' ? 'active' : ''}`}
            onClick={() => setActiveTab('career')}
          >
            🚀 Career Hub
          </button>
          
          <button 
            className={`nav-link ${activeTab === 'learning' ? 'active' : ''}`}
            onClick={() => setActiveTab('learning')}
          >
            📚 Learning
          </button>
          
          <button 
            className={`nav-link ${activeTab === 'opportunities' ? 'active' : ''}`}
            onClick={() => setActiveTab('opportunities')}
          >
            💼 Opportunities
          </button>
          
          {analysisResult && (
            <>
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </button>
              
              <button 
                className={`nav-link ${activeTab === 'keywords' ? 'active' : ''}`}
                onClick={() => setActiveTab('keywords')}
              >
                🔑 Keywords
              </button>

              <button 
                className={`nav-link ${activeTab === 'employability' ? 'active' : ''}`}
                onClick={() => setActiveTab('employability')}
              >
                🎓 Employability Audit
              </button>
            </>
          )}

          <button 
            className={`nav-link ${activeTab === 'optimizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('optimizer')}
          >
            🎯 Bullet Optimizer
          </button>
        </nav>

        {/* User profile section */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Profile clickable icon section */}
          <button 
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: activeTab === 'profile' 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(217, 70, 239, 0.2) 100%)' 
                : 'var(--bg-input)',
              border: activeTab === 'profile' 
                ? '1px solid var(--color-primary)' 
                : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              boxShadow: activeTab === 'profile' 
                ? '0 0 15px rgba(59, 130, 246, 0.3), inset 1px 1px 3px rgba(0,0,0,0.5)' 
                : 'var(--shadow-btn-3d)',
              transform: activeTab === 'profile' ? 'translateY(1px)' : 'translateY(-2px)',
              transition: 'all var(--transition-fast)',
              padding: 0
            }}
            title="View Profile"
          >
            {user.photoURL ? (
              user.photoURL.length <= 2 ? (
                <span style={{ fontSize: '1.2rem' }}>{user.photoURL}</span>
              ) : (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} 
                />
              )
            ) : (
              <span style={{ fontSize: '1.2rem' }}>👤</span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'analyzer' && (
          <ResumeAnalyzer 
            apiKey={apiKey} 
            onAnalysisComplete={handleAnalysisComplete} 
          />
        )}
        
        {activeTab === 'dashboard' && analysisResult && (
          <Dashboard 
            data={analysisResult} 
            onReset={handleReset} 
          />
        )}

        {activeTab === 'keywords' && analysisResult && (
          <KeywordSuggestions 
            data={analysisResult} 
          />
        )}

        {activeTab === 'employability' && analysisResult && (
          <EmployabilityAudit 
            data={analysisResult} 
          />
        )}

        {activeTab === 'optimizer' && (
          <BulletOptimizer 
            apiKey={apiKey} 
            defaultJd={lastJd} 
          />
        )}

        {activeTab === 'career' && (
          <CareerHub user={user} apiKey={apiKey} />
        )}

        {activeTab === 'learning' && (
          <LearningHub user={user} apiKey={apiKey} />
        )}

        {activeTab === 'opportunities' && (
          <OpportunityHub user={user} apiKey={apiKey} />
        )}

        {activeTab === 'profile' && (
          <Profile 
            key={user.uid}
            user={user} 
            apiKey={apiKey} 
            setApiKey={setApiKey}
            onProfileUpdate={triggerUserRefresh}
          />
        )}
      </main>

      {/* Modern Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem 1.5rem', 
        marginTop: 'auto', 
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <p>© {new Date().getFullYear()} ResuBoost AI. All rights reserved. Crafted for visual excellence & premium ATS parsing.</p>
      </footer>
    </div>
  );
}
