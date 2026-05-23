import { useState } from 'react';
import { auth, db, storage } from '../firebase';
import { updateProfile, sendPasswordResetEmail, sendEmailVerification, signOut } from 'firebase/auth';
import { ref, update } from 'firebase/database';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const PRESET_AVATARS = [
  { char: '👨', name: 'Man Avatar' },
  { char: '👩', name: 'Woman Avatar' }
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
  const [keyStatus, setKeyStatus] = useState('none'); // 'none', 'checking', 'connected', 'invalid'

  // App Settings States
  const [theme, setTheme] = useState(localStorage.getItem('resuboost_theme') || 'dark');
  const [notifAts, setNotifAts] = useState(user?.preferences?.notifAts !== false);
  const [notifBullet, setNotifBullet] = useState(user?.preferences?.notifBullet !== false);
  const [notifSecurity, setNotifSecurity] = useState(user?.preferences?.notifSecurity === true);

  // Cache state
  const [cacheCleared, setCacheCleared] = useState(false);

  // Sync keyInput when apiKey prop changes from parent (e.g. on load)
  import { useEffect } from 'react';
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

  // Fallback to name extracted from email if displayName is not configured
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
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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

  // File Change Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileError('Please select a valid image file (PNG/JPEG).');
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
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

  // Profile Save Handler
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
      
      // Upload custom image if chosen
      if (avatarFile) {
        const fileRef = sRef(storage, `profile_pictures/${auth.currentUser.uid}`);
        await uploadBytes(fileRef, avatarFile);
        finalPhotoURL = await getDownloadURL(fileRef);
      }
      
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: trimmedName,
        photoURL: finalPhotoURL
      });
      
      // Update database user record
      const userDbRef = ref(db, `users/${auth.currentUser.uid}`);
      await update(userDbRef, {
        displayName: trimmedName,
        photoURL: finalPhotoURL,
        updatedAt: new Date().toISOString()
      });
      
      // Clear local pending state
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

  // Password Reset Handler
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

  // Email Verification Handler
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

  // API Key Save Handler
  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setApiSaved(false);
    setProfileError('');
    if (!keyInput.trim()) {
      setProfileError('Please enter a valid API Key.');
      return;
    }
    try {
      // 1. Verify Key First
      const res = await fetch('/api/verify-key', {
        headers: { 'x-api-key': keyInput }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        setProfileError(errorData.error || 'Invalid API Key.');
        return;
      }

      // 2. Save Key if Valid
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
    setApiKey(''); // Triggers App.jsx handleApiKeyUpdate
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

  // Theme Preference Change Handler
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

  // Notification Toggles Change Handler
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

  // Cache Clear Handler
  const handleClearCache = () => {
    // Keep credentials, but remove analysis metadata caches if any
    const keysToKeep = ['gemini_api_key', 'resuboost_theme'];
    const storageBackup = {};
    keysToKeep.forEach(k => {
      storageBackup[k] = localStorage.getItem(k);
    });
    
    localStorage.clear();
    
    // Restore preserved keys
    Object.keys(storageBackup).forEach(k => {
      if (storageBackup[k] !== null) {
        localStorage.setItem(k, storageBackup[k]);
      }
    });

    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const displayAvatar = avatarPreview || selectedAvatar || '👨';

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1000px', margin: '1rem auto' }}>
      <div className="profile-dashboard">
        
        {/* Sidebar Panel */}
        <div className="profile-sidebar">
          {/* Visual User Profile Badge */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1.25rem 0.5rem',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--bg-input)',
              border: '2px solid var(--border-color)',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: displayAvatar.length <= 2 ? '2.2rem' : '1rem',
              overflow: 'hidden',
              marginBottom: '0.75rem',
              position: 'relative'
            }}>
              {displayAvatar.length > 2 ? (
                <img 
                  src={displayAvatar} 
                  alt="Avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <span>{displayAvatar}</span>
              )}
            </div>
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
              {getDisplayName()}
            </h3>
            <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem' }}>
              Premium Account
            </span>
          </div>

          {/* Navigation Controls */}
          <button 
            className={`profile-sidebar-btn ${activeSubTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('profile')}
          >
            👤 General Profile
          </button>
          
          <button 
            className={`profile-sidebar-btn ${activeSubTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('security')}
          >
            🔒 Security & Email
          </button>

          <button 
            className={`profile-sidebar-btn ${activeSubTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('api')}
          >
            ⚙️ Gemini API Key
          </button>

          <button 
            className={`profile-sidebar-btn ${activeSubTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('preferences')}
          >
            🎨 App Preferences
          </button>

          <button 
            className={`profile-sidebar-btn ${activeSubTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('help')}
          >
            ❓ Help & Support
          </button>

          {/* Spacer to push logout to the bottom on desktop */}
          <div style={{ flexGrow: 1, minHeight: '2rem' }}></div>

          <button 
            className="profile-sidebar-btn" 
            onClick={() => signOut(auth)}
            style={{ 
              border: '1px solid rgba(244, 63, 94, 0.2)', 
              color: 'var(--color-danger)', 
              marginTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            🚪 Sign Out Account
          </button>
        </div>

        {/* Content Panel */}
        <div className="profile-content">
          
          {/* TAB 1: GENERAL PROFILE */}
          {activeSubTab === 'profile' && (
            <div className="glass-card animate-slide-up" style={{ width: '100%' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                👤 Personal Information
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Manage your public resume persona, display name, and avatar settings.
              </p>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Avatar Selection Picker */}
                <div>
                  <label className="form-label" style={{ marginBottom: '1rem', display: 'block' }}>Choose Profile Emblem</label>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {PRESET_AVATARS.map((av) => {
                        const isSelected = selectedAvatar === av.char && !avatarPreview;
                        return (
                          <button
                            key={av.char}
                            type="button"
                            onClick={() => {
                              setSelectedAvatar(av.char);
                              setAvatarFile(null);
                              setAvatarPreview(null);
                            }}
                            disabled={savingProfile}
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '12px',
                              background: isSelected ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(217, 70, 239, 0.25) 100%)' : 'var(--bg-input)',
                              border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                              fontSize: '1.6rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all var(--transition-fast)',
                              boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none'
                            }}
                            title={av.name}
                          >
                            {av.char}
                          </button>
                        );
                      })}
                    </div>
                    
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>or</span>

                    {/* Custom File Upload */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <input
                        type="file"
                        id="custom-avatar-upload"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={savingProfile}
                        style={{ display: 'none' }}
                      />
                      <label 
                        htmlFor="custom-avatar-upload" 
                        className="btn btn-secondary"
                        style={{ 
                          margin: 0, 
                          padding: '0.6rem 1.25rem', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: avatarPreview ? '0 0 10px rgba(59, 130, 246, 0.2)' : 'none',
                          border: avatarPreview ? '1px solid var(--color-primary)' : '1px solid var(--border-color)'
                        }}
                      >
                        📁 {avatarPreview ? 'Change Photo' : 'Upload Photo'}
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
                  <label className="form-label" htmlFor="profile-display-name">Display Name</label>
                  <input
                    id="profile-display-name"
                    type="text"
                    className="form-input"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    disabled={savingProfile}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ 
                    alignSelf: 'flex-start', 
                    minWidth: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  disabled={savingProfile}
                >
                  {savingProfile ? (
                    <>
                      <span className="spinner-border" /> Saving Details...
                    </>
                  ) : '✓ Update Details'}
                </button>

                {profileSaved && (
                  <div className="badge badge-success" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem' }}>
                    ✓ Display name and emblem saved successfully!
                  </div>
                )}
                {profileError && (
                  <div className="badge badge-danger" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem' }}>
                    ⚠ {profileError}
                  </div>
                )}
              </form>

              {/* Account Details Section */}
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', fontFamily: 'var(--font-display)' }}>
                  📊 System Registration Details
                </h3>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem',
                  background: 'rgba(8, 12, 24, 0.25)',
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Account ID Reference</span>
                    <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.85rem', wordBreak: 'break-all' }}>{user?.uid}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Profile Creation Timestamp</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{getCreationDate()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>Current Session Handshake</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{getLastSignIn()}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SECURITY & EMAIL */}
          {activeSubTab === 'security' && (
            <div className="glass-card animate-slide-up" style={{ width: '100%' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                🔒 Authentication Credentials
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Monitor credentials authentication status and request password updates.
              </p>

              {/* Email Authentication Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                  background: 'rgba(8, 12, 24, 0.25)',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Authentication Email</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.email}</span>
                  </div>
                  <div>
                    {user?.emailVerified ? (
                      <span className="badge badge-success">✓ Verified Address</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-warning">⚠ Verification Required</span>
                        <button 
                          onClick={handleSendVerification} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', transform: 'none', margin: 0, boxShadow: 'none' }}
                        >
                          Send Verification Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password Change Action */}
                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>
                    🔑 Modify Credentials Password
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                    For security purposes, you can trigger a password reset instructions email. A secure URL token will be issued allowing you to construct a new account password.
                  </p>

                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handlePasswordReset}
                    style={{ minWidth: '180px' }}
                  >
                    ✉ Request Password Reset Link
                  </button>
                </div>

                {securityMessage && (
                  <div className={`badge ${resetSent || verificationSent ? 'badge-success' : 'badge-danger'}`} style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', marginTop: '1rem' }}>
                    {securityMessage}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: GEMINI API KEY */}
          {activeSubTab === 'api' && (
            <div className="glass-card animate-slide-up" style={{ width: '100%' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                ⚙️ Gemini API Configuration
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.0rem' }}>
                Manage your system API key to orchestrate resume insights, parsing rubrics, and bullet audits.
              </p>

              {/* Status Indicator */}
              <div style={{
                marginBottom: '2rem',
                padding: '1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: keyStatus === 'connected' ? 'rgba(34, 197, 94, 0.1)' : keyStatus === 'invalid' ? 'rgba(239, 68, 68, 0.1)' : keyStatus === 'checking' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${keyStatus === 'connected' ? 'rgba(34, 197, 94, 0.3)' : keyStatus === 'invalid' ? 'rgba(239, 68, 68, 0.3)' : keyStatus === 'checking' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
              }}>
                <div style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: keyStatus === 'connected' ? '#22c55e' : keyStatus === 'invalid' ? '#ef4444' : keyStatus === 'checking' ? '#3b82f6' : '#6b7280',
                  boxShadow: `0 0 10px ${keyStatus === 'connected' ? '#22c55e' : keyStatus === 'invalid' ? '#ef4444' : keyStatus === 'checking' ? '#3b82f6' : 'transparent'}`
                }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {keyStatus === 'connected' ? 'API Key Active & Valid' : keyStatus === 'invalid' ? 'API Key Invalid or Expired' : keyStatus === 'checking' ? 'Verifying Key Status...' : 'No API Key Configured'}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {keyStatus === 'connected' ? 'System is fully running in AI-powered mode.' : 'System is currently running in offline core mode.'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveApiKey}>
                <div className="form-group">
                  <label className="form-label" htmlFor="api-key-profile">Gemini API Key</label>
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
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowKey(!showKey)}
                      style={{ padding: '0 1.25rem', margin: 0, height: '46px', transform: 'none', boxShadow: 'none' }}
                    >
                      {showKey ? '👁 Hide' : '👁 Show'}
                    </button>
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
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Save & Verify API Key
                  </button>
                  {apiKey && (
                    <button type="button" className="btn btn-secondary" onClick={handleClearApiKey} style={{ flex: 0.3 }}>
                      Clear Key
                    </button>
                  )}
                </div>
              </form>

              {profileError && (
                <div className="badge badge-danger animate-fade-in" style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '1.25rem', padding: '0.5rem' }}>
                  ⚠ {profileError}
                </div>
              )}

              {apiSaved && (
                <div className="badge badge-success animate-fade-in" style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '1.25rem', padding: '0.5rem' }}>
                  ✓ Gemini key verified and saved successfully!
                </div>
              )}

              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)' }}>ℹ️ Offline Parser Core Mode</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                  If the API key is missing or fails validation, ResuBoost automatically executes offline rule-based evaluation. The scanner parses grammar checklists, checks structural formatting grids, and maps keyword intersections locally.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: APP PREFERENCES */}
          {activeSubTab === 'preferences' && (
            <div className="glass-card animate-slide-up" style={{ width: '100%' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                🎨 UI Themes & Settings
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Adjust visual aesthetics, dashboard notifications, and clear local state cache.
              </p>

              {/* Theme Preferences */}
              <div style={{ marginBottom: '2.5rem' }}>
                <label className="form-label" htmlFor="theme-select" style={{ marginBottom: '0.75rem' }}>Select Theme Preference</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <select 
                    id="theme-select"
                    className="form-input" 
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    style={{ 
                      appearance: 'none', 
                      background: 'var(--bg-input)',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="dark">🌌 Atmospheric Cosmic Dark (Default)</option>
                    <option value="light">☀️ Premium Light Mode</option>
                    <option value="cyberpunk">⚡ Neon Cyberpunk 2077</option>
                  </select>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: '1.25rem',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    color: 'var(--text-secondary)',
                    fontWeight: 'bold'
                  }}>
                    ▼
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', textAlign: 'left' }}>
                  🔔 Subscription & Notifications
                </h3>
                
                <div className="toggle-container">
                  <div className="toggle-label">
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Audit Bullet Alerts</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get notified when your bullets index high relevance scores.</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifAts}
                      onChange={(e) => handleNotifToggle('ats', e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-container">
                  <div className="toggle-label">
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>ATS Checkup Updates</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly reminders to scan and re-verify resume formats.</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifBullet}
                      onChange={(e) => handleNotifToggle('bullet', e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-container" style={{ border: 'none' }}>
                  <div className="toggle-label">
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>System Security Warnings</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mute alerts on new IP credential logins and API resets.</span>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={notifSecurity}
                      onChange={(e) => handleNotifToggle('security', e.target.checked)} 
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {/* Saved Data / Activity Cache Management */}
              <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontFamily: 'var(--font-display)', textAlign: 'left' }}>
                  🧹 Clear Account Local Cache
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  Reset parsing analytics, remove cached resume upload configurations, and reset system cache to defaults. Your Gemini API key configuration and theme selection will be preserved.
                </p>

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClearCache}
                  style={{ border: '1px solid rgba(245, 158, 11, 0.25)', color: 'var(--color-warning)' }}
                >
                  ⚠ Clear Local Storage Cache
                </button>

                {cacheCleared && (
                  <div className="badge badge-warning" style={{ display: 'block', width: '100%', textAlign: 'center', marginTop: '1rem', padding: '0.5rem' }}>
                    ✓ Non-credential local storage keys purged successfully!
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: HELP & SUPPORT */}
          {activeSubTab === 'help' && (
            <div className="glass-card animate-slide-up" style={{ width: '100%' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                ❓ Help Guidelines & FAQs
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Resolve commonly reported platform inquiries and access developers API guides.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                
                <div style={{ 
                  background: 'rgba(8, 12, 24, 0.2)', 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid rgba(255,255,255,0.04)' 
                }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    How is the ATS Score calculated?
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    The scanner grades formats, bullet structures, and keyword density. We run calculations factoring in industry rubrics, layout grids, and active keywords to compute an overall match indicator percentage.
                  </p>
                </div>

                <div style={{ 
                  background: 'rgba(8, 12, 24, 0.2)', 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid rgba(255,255,255,0.04)' 
                }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    Why configure a Gemini API key?
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    An active key unlocks cognitive ATS audits. The system parses deep context semantics, updates bullet structure with impact verbs, and recommends strategic target keywords.
                  </p>
                </div>

                <div style={{ 
                  background: 'rgba(8, 12, 24, 0.2)', 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid rgba(255,255,255,0.04)' 
                }}>
                  <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                    Is my system API key kept confidential?
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Absolutely. ResuBoost saves keys directly in the local sandbox browser storage. Your credentials never traverse outside local network scopes and are dispatched strictly to Google's API endpoints.
                  </p>
                </div>

                <div style={{ 
                  marginTop: '1rem',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(217, 70, 239, 0.08) 100%)', 
                  padding: '1.5rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
                    ✉ Need Direct Human Support?
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                    Our engineering and resume strategy teams are ready to audit your setup. Reach out and verify customized ATS parser templates.
                  </p>
                  <a 
                    href="mailto:support@resuboost.ai" 
                    className="btn btn-secondary" 
                    style={{ alignSelf: 'flex-start', margin: '0.5rem 0 0 0', fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
                  >
                    💬 Contact Support System
                  </a>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
