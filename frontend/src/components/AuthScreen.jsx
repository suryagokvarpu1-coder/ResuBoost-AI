import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to authenticate. Please check your network and credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errMsg = 'Incorrect email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password must be at least 6 characters long.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Please enter a valid email address.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ 
      maxWidth: '480px', 
      margin: '4rem auto 2rem auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.5rem' 
    }}>
      {/* Visual App Logo / Intro */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
          borderRadius: '16px',
          boxShadow: '0 8px 25px rgba(217, 70, 239, 0.35)',
          marginBottom: '1rem',
          position: 'relative',
          padding: '2px'
        }}>
          <img src="/resuboost_logo.png" alt="ResuBoost Logo" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            height: '40%',
            background: 'rgba(255, 255, 255, 0.25)',
            borderRadius: '5px',
            pointerEvents: 'none'
          }} />
        </div>
        
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
          Welcome to <span className="glow-text-gradient">ResuBoost AI</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
          Secure ATS Resume Audit & AI Optimization Platform
        </p>
      </div>

      {/* Main Authentication Box */}
      <div className="glass-card" style={{ padding: '2.5rem 2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800, 
          marginBottom: '1.5rem',
          textAlign: 'center' 
        }}>
          {isSignUp ? 'Create your Account' : 'Sign In to ResuBoost'}
        </h2>

        {error && (
          <div className="badge badge-danger animate-fade-in" style={{ 
            display: 'block', 
            padding: '0.75rem', 
            marginBottom: '1.25rem', 
            textAlign: 'center',
            fontSize: '0.85rem'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isSignUp ? '⚡ Sign Up' : '🔑 Sign In'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-muted)', 
          fontSize: '0.8rem', 
          margin: '1.5rem 0' 
        }}>
          — OR CONTINUE WITH —
        </div>

        {/* Google Sign In */}
        <button 
          onClick={handleGoogleSignIn}
          className="btn btn-secondary" 
          style={{ width: '100%', padding: '0.85rem', display: 'flex', gap: '0.75rem' }}
          disabled={loading}
        >
          {/* Custom colorful 3D Google G icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>
            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.94 1 12 1 7.35 1 3.37 3.68 1.48 7.58l3.8 2.94C6.21 7.37 8.87 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.38-4.89 3.38-8.51z"/>
            <path fill="#FBBC05" d="M5.28 14.52a6.99 6.99 0 0 1 0-4.04L1.48 7.54a11.98 11.98 0 0 0 0 10.92l3.8-2.94z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.13 0-5.79-2.33-6.74-5.48L1.46 15.8C3.35 19.7 7.33 22.36 12 22.36z"/>
          </svg>
          Google Identity
        </button>

        {/* Toggle Switch */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button 
            type="button" 
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-primary)', 
              fontWeight: 700, 
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
