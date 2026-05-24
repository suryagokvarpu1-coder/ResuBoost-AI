import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertTriangle, Sparkles, ArrowRight, Loader } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
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
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ maxWidth: '440px', width: '100%', margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', position: 'relative' }}
    >
      {/* Subtle backdrop glow behind the login modal */}
      <div style={{ position: 'absolute', inset: -50, background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '52px', height: '52px',
            background: 'var(--gradient-primary)',
            borderRadius: '13px',
            boxShadow: '0 8px 25px rgba(217, 70, 239, 0.2)',
            marginBottom: 'var(--space-4)', padding: '3px',
          }}
        >
          <img src="/resuboost_logo.png" alt="ResuBoost" style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
        </motion.div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 850, color: '#fff', letterSpacing: '-0.03em' }}>
          Welcome to <span className="glow-text-gradient">ResuBoost AI</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 'var(--space-2)' }}>
          AI-Powered Resume Analysis & Career Platform
        </p>
      </div>

      {/* Auth Card */}
      <motion.div
        className="glass-card glass-card-static"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ padding: 'var(--space-10) var(--space-8)', position: 'relative', zIndex: 1 }}
      >
        <AnimatePresence mode="wait">
          <motion.h2
            key={isSignUp ? 'signup' : 'signin'}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="text-center"
            style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: 'var(--space-6)' }}
          >
            {isSignUp ? 'Create your Account' : 'Sign In to Continue'}
          </motion.h2>
        </AnimatePresence>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="badge badge-danger"
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-4)',
                marginBottom: 'var(--space-5)', width: '100%',
                fontSize: '0.85rem', textTransform: 'none', letterSpacing: 0,
              }}
            >
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex-col gap-4">
          {/* Email */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-icon" />
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
          </div>

          {/* Password */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <div className="input-with-icon">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{ paddingRight: '3rem' }}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn-ghost"
                style={{
                  position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)',
                  padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            className="btn btn-primary w-full"
            style={{ padding: '0.85rem', marginTop: 'var(--space-2)' }}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex-center gap-2">
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Authenticating...
              </span>
            ) : (
              <span className="flex-center gap-2">
                {isSignUp ? <Sparkles size={16} /> : <ArrowRight size={16} />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </span>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex-center gap-3" style={{ margin: 'var(--space-6) 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            or continue with
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Google Sign In */}
        <motion.button
          onClick={handleGoogleSignIn}
          className="btn btn-secondary w-full"
          style={{ padding: '0.85rem' }}
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}>
            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.94 1 12 1 7.35 1 3.37 3.68 1.48 7.58l3.8 2.94C6.21 7.37 8.87 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.6-.2-2.36H12v4.47h6.47c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.98 3.38-4.89 3.38-8.51z"/>
            <path fill="#FBBC05" d="M5.28 14.52a6.99 6.99 0 0 1 0-4.04L1.48 7.54a11.98 11.98 0 0 0 0 10.92l3.8-2.94z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.13 0-5.79-2.33-6.74-5.48L1.46 15.8C3.35 19.7 7.33 22.36 12 22.36z"/>
          </svg>
          <span>Continue with Google</span>
        </motion.button>

        {/* Toggle Auth Mode */}
        <div className="text-center" style={{ marginTop: 'var(--space-6)', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </span>
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--color-primary)', fontWeight: 700,
              cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
