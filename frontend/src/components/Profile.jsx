import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Settings, Palette, HelpCircle, LogOut, Save,
  Eye, EyeOff, Key, CheckCircle, XCircle, AlertTriangle,
  Upload, Loader, Trash2, Mail, Lock, Bell, Sun, Moon, Zap,
  Image, ChevronDown, MessageSquare, ExternalLink, Info
} from 'lucide-react';
import { auth, db, storage } from '../firebase';
import { updateProfile, sendPasswordResetEmail, sendEmailVerification, signOut } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const PRESET_AVATARS = [
  { char: '👨', name: 'Man Avatar' },
  { char: '👩', name: 'Woman Avatar' }
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
};

const sidebarItems = [
  { key: 'profile', label: 'General Profile', icon: User },
  { key: 'security', label: 'Security & Email', icon: Shield },
  { key: 'api', label: 'Gemini API Key', icon: Settings },
  { key: 'preferences', label: 'App Preferences', icon: Palette },
  { key: 'help', label: 'Help & Support', icon: HelpCircle }
];

export default function Profile({ user, apiKey, setApiKey, onProfileUpdate }) {
  const [activeSubTab, setActiveSubTab] = useState('profile');

  // Edit Profile States
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || '👨');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Security Reset States
  const [resetSent, setResetSent] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');

  // Gemini API Key States
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [apiSaved, setApiSaved] = useState(false);
  const [keyStatus, setKeyStatus] = useState('none');

  // App Settings States
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('resuboost_theme') || 'dark';
    return savedTheme === 'light' ? 'dark' : savedTheme;
  });
  const [notifAts, setNotifAts] = useState(user?.preferences?.notifAts !== false);
  const [notifBullet, setNotifBullet] = useState(user?.preferences?.notifBullet !== false);
  const [notifSecurity, setNotifSecurity] = useState(user?.preferences?.notifSecurity === true);

  // Cache state
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => {
    setKeyInput(apiKey || '');
  }, [apiKey]);

  // Check live API key status
  useEffect(() => {
    if (!apiKey) {
      setKeyStatus('none');
      return;
    }
    let isMounted = true;
    const verifyLiveKey = async () => {
      setKeyStatus('checking');
      try {
        const res = await fetch('/api/verify-key', { headers: { 'x-api-key': apiKey } });
        if (isMounted) {
          setKeyStatus(res.ok ? 'connected' : 'invalid');
        }
      } catch (e) {
        if (isMounted) setKeyStatus('invalid');
      }
    };
    verifyLiveKey();
    return () => { isMounted = false; };
  }, [apiKey]);

  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      const parts = user.email.split('@')[0];
      return parts.charAt(0).toUpperCase() + parts.slice(1);
    }
    return 'ResuBoost Member';
  };

  const getCreationDate = () => {
    if (user?.metadata?.creationTime) {
      return new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    }
    return 'Recent Member';
  };

  const getLastSignIn = () => {
    if (user?.metadata?.lastSignInTime) {
      return new Date(user.metadata.lastSignInTime).toLocaleString();
    }
    return 'Active Session';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileError('Please select a valid image file (PNG/JPEG).');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setProfileError('Image file size must be less than 2MB.');
        return;
      }

      setAvatarFile(file);
      setProfileError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaved(false);
    setProfileError('');
    setSavingProfile(true);

    if (!auth.currentUser) {
      setProfileError('Authentication required. Please sign in again.');
      setSavingProfile(false);
      return;
    }

    if (user && auth.currentUser.uid !== user.uid) {
      setProfileError('Security Alert: User session ID mismatch. Please re-authenticate.');
      setSavingProfile(false);
      return;
    }

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setProfileError('Display name cannot be empty.');
      setSavingProfile(false);
      return;
    }
    if (trimmedName.length < 2 || trimmedName.length > 30) {
      setProfileError('Display name must be between 2 and 30 characters.');
      setSavingProfile(false);
      return;
    }

    try {
      let finalPhotoURL = selectedAvatar;

      if (avatarFile) {
        const fileRef = sRef(storage, `profile_pictures/${auth.currentUser.uid}`);
        await uploadBytes(fileRef, avatarFile);
        finalPhotoURL = await getDownloadURL(fileRef);
      }

      await updateProfile(auth.currentUser, {
        displayName: trimmedName,
        photoURL: finalPhotoURL
      });

      const userDbRef = ref(db, `users/${auth.currentUser.uid}`);
      await update(userDbRef, {
        displayName: trimmedName,
        photoURL: finalPhotoURL,
        updatedAt: new Date().toISOString()
      });

      setAvatarFile(null);
      setAvatarPreview(null);
      setSelectedAvatar(finalPhotoURL);

      if (onProfileUpdate) {
        await onProfileUpdate();
      }

      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      console.error("Profile update failed:", err);
      let friendlyMsg = 'Failed to update profile details. Please try again.';
      const errMsg = (err.message || '').toLowerCase();

      if (errMsg.includes('permission_denied') || errMsg.includes('permission denied') || errMsg.includes('permission-denied')) {
        friendlyMsg = 'Access Denied: You do not have permission to modify this profile record. Please check that your Firebase Database and Storage rules are deployed and configured correctly.';
      } else if (errMsg.includes('quota exceeded') || errMsg.includes('storage/quota-exceeded')) {
        friendlyMsg = 'Storage Limit Exceeded: Please try uploading a smaller image file.';
      } else if (errMsg.includes('unauthorized') || errMsg.includes('storage/unauthorized')) {
        friendlyMsg = 'Access Denied: Permission denied when uploading the profile image to Firebase Storage.';
      } else if (errMsg.includes('network') || errMsg.includes('timeout')) {
        friendlyMsg = 'Network Error: Check your connection and try again.';
      } else {
        friendlyMsg = err.message || friendlyMsg;
      }
      setProfileError(friendlyMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordReset = async () => {
    setResetSent(false);
    setSecurityMessage('');
    try {
      if (user?.email) {
        await sendPasswordResetEmail(auth, user.email);
        setResetSent(true);
        setSecurityMessage('A secure password reset link has been dispatched to your email.');
      }
    } catch (err) {
      setSecurityMessage(`Error: ${err.message}`);
    }
  };

  const handleSendVerification = async () => {
    setVerificationSent(false);
    setSecurityMessage('');
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
        setSecurityMessage('Verification link has been sent to your email.');
        if (onProfileUpdate) {
          await onProfileUpdate();
        }
      }
    } catch (err) {
      setSecurityMessage(`Error: ${err.message}`);
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setApiSaved(false);
    setProfileError('');
    if (!keyInput.trim()) {
      setProfileError('Please enter a valid API Key.');
      return;
    }
    try {
      const res = await fetch('/api/verify-key', {
        headers: { 'x-api-key': keyInput }
      });

      if (!res.ok) {
        const errorData = await res.json();
        setProfileError(errorData.error || 'Invalid API Key.');
        return;
      }

      setApiKey(keyInput);
      localStorage.setItem('gemini_api_key', keyInput);

      if (auth.currentUser) {
        const userDbRef = ref(db, `users/${auth.currentUser.uid}`);
        await update(userDbRef, {
          apiKey: keyInput
        });
      }
      setApiSaved(true);
      setTimeout(() => setApiSaved(false), 3000);
    } catch (err) {
      console.error("Save API Key failed:", err);
      setProfileError('Network error during verification.');
    }
  };

  const handleClearApiKey = async () => {
    setKeyInput('');
    setApiKey('');
    localStorage.removeItem('gemini_api_key');

    if (auth.currentUser) {
      try {
        const userDbRef = ref(db, `users/${auth.currentUser.uid}`);
        await update(userDbRef, {
          apiKey: ''
        });
      } catch (err) {
        console.error("Clear API Key failed:", err);
      }
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('resuboost_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    if (auth.currentUser) {
      try {
        const userDbRef = ref(db, `users/${auth.currentUser.uid}/preferences`);
        await update(userDbRef, {
          theme: newTheme
        });
      } catch (err) {
        console.error("Save theme failed:", err);
      }
    }
  };

  const handleNotifToggle = async (type, val) => {
    if (type === 'ats') setNotifAts(val);
    if (type === 'bullet') setNotifBullet(val);
    if (type === 'security') setNotifSecurity(val);

    if (auth.currentUser) {
      try {
        const userDbRef = ref(db, `users/${auth.currentUser.uid}/preferences`);
        await update(userDbRef, {
          [type === 'ats' ? 'notifAts' : type === 'bullet' ? 'notifBullet' : 'notifSecurity']: val
        });
      } catch (err) {
        console.error("Failed to save preference toggle:", err);
      }
    }
  };

  const handleClearCache = () => {
    const keysToKeep = ['gemini_api_key', 'resuboost_theme'];
    const storageBackup = {};
    keysToKeep.forEach(k => {
      storageBackup[k] = localStorage.getItem(k);
    });

    localStorage.clear();

    Object.keys(storageBackup).forEach(k => {
      if (storageBackup[k] !== null) {
        localStorage.setItem(k, storageBackup[k]);
      }
    });

    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const displayAvatar = avatarPreview || selectedAvatar || '👨';

  const keyStatusConfig = {
    connected: { color: '#22c55e', label: 'API Key Active & Valid', sub: 'System is fully running in AI-powered mode.', Icon: CheckCircle, bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)' },
    invalid: { color: '#ef4444', label: 'API Key Invalid or Expired', sub: 'System is currently running in offline core mode.', Icon: XCircle, bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)' },
    checking: { color: '#3b82f6', label: 'Verifying Key Status...', sub: 'System is currently running in offline core mode.', Icon: Loader, bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)' },
    none: { color: '#6b7280', label: 'No API Key Configured', sub: 'System is currently running in offline core mode.', Icon: Key, bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' }
  };
  const ks = keyStatusConfig[keyStatus] || keyStatusConfig.none;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 1000, margin: '1rem auto' }}>
      <div className="profile-dashboard">

        {/* Sidebar Panel */}
        <div className="profile-sidebar">
          {/* User Badge */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '1.25rem 0.5rem', borderBottom: '1px solid var(--border-color)',
            marginBottom: '1rem', textAlign: 'center'
          }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--bg-input)', border: '2px solid var(--border-color)',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: displayAvatar.length <= 2 ? '2.2rem' : '1rem',
                overflow: 'hidden', marginBottom: '0.75rem', position: 'relative'
              }}
            >
              {displayAvatar.length > 2 ? (
                <img src={displayAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{displayAvatar}</span>
              )}
            </motion.div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
              {getDisplayName()}
            </h3>
            <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={10} /> Premium Account
            </span>
          </div>

          {/* Nav Items */}
          {sidebarItems.map(item => (
            <motion.button
              key={item.key}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              className={`profile-sidebar-btn ${activeSubTab === item.key ? 'active' : ''}`}
              onClick={() => setActiveSubTab(item.key)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <item.icon size={16} /> {item.label}
            </motion.button>
          ))}

          <div style={{ flexGrow: 1, minHeight: '2rem' }} />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="profile-sidebar-btn"
            onClick={() => signOut(auth)}
            style={{
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: 'var(--color-danger)',
              marginTop: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem'
            }}
          >
            <LogOut size={16} /> Sign Out Account
          </motion.button>
        </div>

        {/* Content Panel */}
        <div className="profile-content">
          <AnimatePresence mode="wait">

            {/* TAB 1: GENERAL PROFILE */}
            {activeSubTab === 'profile' && (
              <motion.div key="profile" {...fadeUp} className="glass-card" style={{ width: '100%' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <User size={24} style={{ color: 'var(--color-primary)' }} /> Personal Information
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Manage your public resume persona, display name, and avatar settings.
                </p>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                  {/* Avatar Picker */}
                  <div>
                    <label className="form-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Image size={14} /> Choose Profile Emblem
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {PRESET_AVATARS.map((av) => {
                          const isSelected = selectedAvatar === av.char && !avatarPreview;
                          return (
                            <motion.button
                              key={av.char}
                              type="button"
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedAvatar(av.char);
                                setAvatarFile(null);
                                setAvatarPreview(null);
                              }}
                              disabled={savingProfile}
                              style={{
                                width: 50, height: 50, borderRadius: 12,
                                background: isSelected ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(217, 70, 239, 0.25) 100%)' : 'var(--bg-input)',
                                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                                fontSize: '1.6rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none'
                              }}
                              title={av.name}
                            >
                              {av.char}
                            </motion.button>
                          );
                        })}
                      </div>

                      <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>or</span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <input type="file" id="custom-avatar-upload" accept="image/*" onChange={handleFileChange} disabled={savingProfile} style={{ display: 'none' }} />
                        <label
                          htmlFor="custom-avatar-upload"
                          className="btn btn-secondary"
                          style={{
                            margin: 0, padding: '0.6rem 1.25rem', fontSize: '0.85rem', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: avatarPreview ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none',
                            border: avatarPreview ? '1px solid var(--color-primary)' : '1px solid var(--border-color)'
                          }}
                        >
                          <Upload size={14} /> {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                        </label>
                        {avatarFile && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', marginTop: '0.25rem', fontWeight: 600 }}>
                            Pending: {avatarFile.name} ({(avatarFile.size / 1024).toFixed(1)} KB)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="profile-display-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={14} /> Display Name
                    </label>
                    <input
                      id="profile-display-name" type="text" className="form-input"
                      placeholder="Enter your name" value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required disabled={savingProfile}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit" className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    disabled={savingProfile}
                  >
                    {savingProfile ? (
                      <><Loader size={16} className="spin-icon" /> Saving Details...</>
                    ) : (
                      <><Save size={16} /> Update Details</>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {profileSaved && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="badge badge-success" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={14} /> Display name and emblem saved successfully!
                      </motion.div>
                    )}
                    {profileError && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="badge badge-danger" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={14} /> {profileError}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {/* Account Details */}
                <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={18} style={{ color: 'var(--color-accent)' }} /> System Registration Details
                  </h3>

                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '1rem',
                    background: 'rgba(8, 12, 24, 0.25)', padding: '1.25rem 1.5rem',
                    borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.04)'
                  }}>
                    {[
                      { label: 'Account ID Reference', value: user?.uid, mono: true },
                      { label: 'Profile Creation Timestamp', value: getCreationDate() },
                      { label: 'Current Session Handshake', value: getLastSignIn() }
                    ].map((row, i, arr) => (
                      <div key={row.label} style={{
                        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                        paddingBottom: i < arr.length - 1 ? '0.75rem' : 0
                      }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>{row.label}</span>
                        <span style={{ color: 'var(--text-primary)', fontFamily: row.mono ? 'monospace' : 'inherit', fontSize: row.mono ? '0.85rem' : '0.9rem', wordBreak: 'break-all' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: SECURITY & EMAIL */}
            {activeSubTab === 'security' && (
              <motion.div key="security" {...fadeUp} className="glass-card" style={{ width: '100%' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Shield size={24} style={{ color: 'var(--color-primary)' }} /> Authentication Credentials
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Monitor credentials authentication status and request password updates.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{
                    background: 'rgba(8, 12, 24, 0.25)', padding: '1.5rem',
                    borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={12} /> Authentication Email
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.email}</span>
                    </div>
                    <div>
                      {user?.emailVerified ? (
                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle size={13} /> Verified Address
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertTriangle size={13} /> Verification Required
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSendVerification}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', transform: 'none', margin: 0, boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Mail size={12} /> Send Verification Link
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Lock size={18} /> Modify Credentials Password
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                      For security purposes, you can trigger a password reset instructions email. A secure URL token will be issued allowing you to construct a new account password.
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="button" className="btn btn-secondary"
                      onClick={handlePasswordReset}
                      style={{ minWidth: 180, display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Mail size={16} /> Request Password Reset Link
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {securityMessage && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`badge ${resetSent || verificationSent ? 'badge-success' : 'badge-danger'}`}
                        style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {resetSent || verificationSent ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {securityMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* TAB 3: GEMINI API KEY */}
            {activeSubTab === 'api' && (
              <motion.div key="api" {...fadeUp} className="glass-card" style={{ width: '100%' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Settings size={24} style={{ color: 'var(--color-primary)' }} /> Gemini API Configuration
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.0rem' }}>
                  Manage your system API key to orchestrate resume insights, parsing rubrics, and bullet audits.
                </p>

                {/* Status Indicator */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginBottom: '2rem', padding: '1rem', borderRadius: 8,
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: ks.bg, border: `1px solid ${ks.border}`
                  }}
                >
                  <div style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: ks.color,
                    boxShadow: `0 0 10px ${ks.color}`
                  }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <ks.Icon size={15} style={{ color: ks.color }} /> {ks.label}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ks.sub}</span>
                  </div>
                </motion.div>

                <form onSubmit={handleSaveApiKey}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="api-key-profile" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Key size={14} /> Gemini API Key
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        id="api-key-profile"
                        type={showKey ? 'text' : 'password'}
                        className="form-input"
                        placeholder="AIzaSy..."
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        type="button" className="btn btn-secondary"
                        onClick={() => setShowKey(!showKey)}
                        style={{ padding: '0 1.25rem', margin: 0, height: 46, transform: 'none', boxShadow: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showKey ? 'Hide' : 'Show'}
                      </motion.button>
                    </div>
                    <small style={{ display: 'block', marginTop: '0.6rem', color: 'var(--text-muted)' }}>
                      Your key resides exclusively inside local browser sandboxing. It is issued directly to Gemini endpoint requests. Fetch a key free-of-charge from the{' '}
                      <a
                        href="https://aistudio.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
                      >
                        Google AI Studio Portal
                      </a>.
                    </small>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Save size={16} /> Save & Verify API Key
                    </motion.button>
                    {apiKey && (
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        type="button" className="btn btn-secondary" onClick={handleClearApiKey} style={{ flex: 0.3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Trash2 size={14} /> Clear Key
                      </motion.button>
                    )}
                  </div>
                </form>

                <AnimatePresence>
                  {profileError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="badge badge-danger" style={{ display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center', marginTop: '1.25rem', padding: '0.5rem', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={14} /> {profileError}
                    </motion.div>
                  )}
                  {apiSaved && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="badge badge-success" style={{ display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center', marginTop: '1.25rem', padding: '0.5rem', alignItems: 'center', gap: 6 }}>
                      <CheckCircle size={14} /> Gemini key verified and saved successfully!
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Info size={16} style={{ color: 'var(--text-muted)' }} /> Offline Parser Core Mode
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    If the API key is missing or fails validation, ResuBoost automatically executes offline rule-based evaluation. The scanner parses grammar checklists, checks structural formatting grids, and maps keyword intersections locally.
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB 4: APP PREFERENCES */}
            {activeSubTab === 'preferences' && (
              <motion.div key="preferences" {...fadeUp} className="glass-card" style={{ width: '100%' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Palette size={24} style={{ color: 'var(--color-primary)' }} /> UI Themes & Settings
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Adjust visual aesthetics, dashboard notifications, and clear local state cache.
                </p>

                {/* Theme Preferences */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <label className="form-label" htmlFor="theme-select" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sun size={14} /> Select Theme Preference
                  </label>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <select
                      id="theme-select"
                      className="form-input"
                      value={theme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      style={{ appearance: 'none', background: 'var(--bg-input)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600 }}
                    >
                      <option value="dark">🌌 Atmospheric Cosmic Dark (Default)</option>
                      <option value="cyberpunk">⚡ Neon Cyberpunk 2077</option>
                    </select>
                    <div style={{ position: 'absolute', top: '50%', right: '1.25rem', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bell size={18} /> Subscription & Notifications
                  </h3>

                  {[
                    { type: 'ats', label: 'Audit Bullet Alerts', desc: 'Get notified when your bullets index high relevance scores.', checked: notifAts },
                    { type: 'bullet', label: 'ATS Checkup Updates', desc: 'Weekly reminders to scan and re-verify resume formats.', checked: notifBullet },
                    { type: 'security', label: 'System Security Warnings', desc: 'Mute alerts on new IP credential logins and API resets.', checked: notifSecurity, noBorder: true }
                  ].map(n => (
                    <div key={n.type} className="toggle-container" style={n.noBorder ? { border: 'none' } : {}}>
                      <div className="toggle-label">
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{n.label}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.desc}</span>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={n.checked} onChange={(e) => handleNotifToggle(n.type, e.target.checked)} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Cache Clear */}
                <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Trash2 size={18} style={{ color: 'var(--color-warning)' }} /> Clear Account Local Cache
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    Reset parsing analytics, remove cached resume upload configurations, and reset system cache to defaults. Your Gemini API key configuration and theme selection will be preserved.
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button" className="btn btn-secondary"
                    onClick={handleClearCache}
                    style={{ border: '1px solid rgba(245, 158, 11, 0.25)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <AlertTriangle size={16} /> Clear Local Storage Cache
                  </motion.button>

                  <AnimatePresence>
                    {cacheCleared && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="badge badge-warning" style={{ display: 'flex', width: '100%', textAlign: 'center', justifyContent: 'center', marginTop: '1rem', padding: '0.5rem', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={14} /> Non-credential local storage keys purged successfully!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* TAB 5: HELP & SUPPORT */}
            {activeSubTab === 'help' && (
              <motion.div key="help" {...fadeUp} className="glass-card" style={{ width: '100%' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <HelpCircle size={24} style={{ color: 'var(--color-primary)' }} /> Help Guidelines & FAQs
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  Resolve commonly reported platform inquiries and access developers API guides.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                  {[
                    { q: 'How is the ATS Score calculated?', a: 'The scanner grades formats, bullet structures, and keyword density. We run calculations factoring in industry rubrics, layout grids, and active keywords to compute an overall match indicator percentage.' },
                    { q: 'Why configure a Gemini API key?', a: 'An active key unlocks cognitive ATS audits. The system parses deep context semantics, updates bullet structure with impact verbs, and recommends strategic target keywords.' },
                    { q: 'Is my system API key kept confidential?', a: 'Absolutely. ResuBoost saves keys directly in the local sandbox browser storage. Your credentials never traverse outside local network scopes and are dispatched strictly to Google\'s API endpoints.' }
                  ].map((faq, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      style={{
                        background: 'rgba(8, 12, 24, 0.2)', padding: '1.25rem',
                        borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.04)'
                      }}
                    >
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <HelpCircle size={16} /> {faq.q}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{faq.a}</p>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      marginTop: '1rem',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(217, 70, 239, 0.08) 100%)',
                      padding: '1.5rem', borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex', flexDirection: 'column', gap: '0.75rem'
                    }}
                  >
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MessageSquare size={18} style={{ color: 'var(--color-secondary)' }} /> Need Direct Human Support?
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      Our engineering and resume strategy teams are ready to audit your setup. Reach out and verify customized ATS parser templates.
                    </p>
                    <motion.a
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      href="mailto:support@resuboost.ai"
                      className="btn btn-secondary"
                      style={{ alignSelf: 'flex-start', margin: '0.5rem 0 0 0', fontSize: '0.85rem', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <ExternalLink size={14} /> Contact Support System
                    </motion.a>
                  </motion.div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
