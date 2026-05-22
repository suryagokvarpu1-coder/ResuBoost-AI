import { useState } from 'react';

const STEPS = [
  { id: 'category', title: 'Who Are You?', subtitle: 'Select your current professional status', icon: '👤' },
  { id: 'education', title: 'Education Background', subtitle: 'Tell us about your academic journey', icon: '🎓' },
  { id: 'domain', title: 'Your Domain / Field', subtitle: 'Which industry or sector are you in or aspiring to?', icon: '🌐' },
  { id: 'goals', title: 'Career Goals', subtitle: 'What do you want to achieve?', icon: '🎯' },
  { id: 'skills', title: 'Your Skills', subtitle: 'List your current skills (comma-separated)', icon: '⚡' },
];

const CATEGORIES = [
  { id: 'student_10', label: 'Student (After 10th)', icon: '📘' },
  { id: 'student_12', label: 'Student (After 12th)', icon: '📗' },
  { id: 'student_diploma', label: 'Diploma Student', icon: '📜' },
  { id: 'student_ug', label: 'Undergraduate', icon: '🎓' },
  { id: 'student_pg', label: 'Postgraduate', icon: '🏛️' },
  { id: 'student_research', label: 'Research Scholar / PhD', icon: '🔬' },
  { id: 'fresher', label: 'Fresher / Graduate', icon: '🌱' },
  { id: 'experienced', label: 'Experienced Professional', icon: '🏆' },
  { id: 'lawyer', label: 'Legal Professional', icon: '⚖️' },
  { id: 'doctor', label: 'Healthcare Professional', icon: '🏥' },
  { id: 'defense', label: 'Defense Aspirant', icon: '🎖️' },
  { id: 'govt_aspirant', label: 'Govt. Job Aspirant', icon: '🏛️' },
  { id: 'entrepreneur', label: 'Entrepreneur / Founder', icon: '🚀' },
  { id: 'freelancer', label: 'Freelancer / Remote Worker', icon: '🌐' },
  { id: 'teacher', label: 'Teacher / Researcher', icon: '📚' },
  { id: 'skilled_worker', label: 'Skilled Worker / Technician', icon: '🔩' },
];

const DOMAINS = [
  { id: 'software_it', label: 'Software & IT', icon: '💻', color: '#3b82f6' },
  { id: 'ai_data_science', label: 'AI / Data Science', icon: '🤖', color: '#8b5cf6' },
  { id: 'hardware_embedded', label: 'Hardware / Embedded', icon: '🔧', color: '#64748b' },
  { id: 'legal', label: 'Legal & Judiciary', icon: '⚖️', color: '#d97706' },
  { id: 'medical_healthcare', label: 'Medical & Healthcare', icon: '🏥', color: '#ef4444' },
  { id: 'civil_architecture', label: 'Civil / Architecture', icon: '🏗️', color: '#78716c' },
  { id: 'defense_security', label: 'Defense & Security', icon: '🎖️', color: '#16a34a' },
  { id: 'government', label: 'Government Services', icon: '🏛️', color: '#0891b2' },
  { id: 'business_entrepreneurship', label: 'Business / Startup', icon: '🚀', color: '#f97316' },
  { id: 'banking_finance', label: 'Banking & Finance', icon: '🏦', color: '#eab308' },
  { id: 'marketing_media', label: 'Marketing / Media', icon: '📣', color: '#f43f5e' },
  { id: 'teaching_research', label: 'Teaching / Research', icon: '📚', color: '#84cc16' },
  { id: 'freelancing', label: 'Freelancing / Remote', icon: '🌐', color: '#22c55e' },
  { id: 'skilled_vocational', label: 'Skilled / Vocational', icon: '🔩', color: '#78716c' },
];

const GOALS = [
  { id: 'get_first_job', label: 'Land My First Job', icon: '💼' },
  { id: 'get_internship', label: 'Get an Internship', icon: '🎓' },
  { id: 'career_switch', label: 'Switch My Career', icon: '🔄' },
  { id: 'upskill', label: 'Upskill / Reskill', icon: '📈' },
  { id: 'govt_exam', label: 'Crack a Govt. Exam', icon: '🏛️' },
  { id: 'start_business', label: 'Start a Business', icon: '🚀' },
  { id: 'get_promotion', label: 'Get a Promotion', icon: '⬆️' },
  { id: 'study_abroad', label: 'Study / Work Abroad', icon: '✈️' },
  { id: 'freelance', label: 'Build Freelance Career', icon: '🌐' },
  { id: 'research', label: 'Pursue Research / PhD', icon: '🔬' },
];

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    category: '',
    education: '',
    educationField: '',
    domain: '',
    goal: '',
    skills: '',
    experience: '',
    location: '',
    workType: ''
  });

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  const handleSelect = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (step === 0) return !!profile.category;
    if (step === 1) return !!profile.education;
    if (step === 2) return !!profile.domain;
    if (step === 3) return !!profile.goal;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    const finalProfile = {
      ...profile,
      skills: profile.skills.split(',').map(s => s.trim()).filter(Boolean)
    };
    localStorage.setItem('resuboost_user_profile', JSON.stringify(finalProfile));
    onComplete(finalProfile);
  };

  const SelectCard = ({ item, field, selectedValue, color }) => {
    const isSelected = selectedValue === item.id;
    return (
      <button
        onClick={() => handleSelect(field, item.id)}
        style={{
          background: isSelected
            ? `linear-gradient(135deg, ${color || 'var(--color-primary)'}22, ${color || 'var(--color-secondary)'}22)`
            : 'var(--bg-surface)',
          border: isSelected
            ? `2px solid ${color || 'var(--color-primary)'}`
            : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          transition: 'all var(--transition-fast)',
          transform: isSelected ? 'translateY(-3px)' : 'none',
          boxShadow: isSelected ? `0 8px 25px ${color || 'var(--color-primary)'}33` : 'var(--shadow-clay)',
          textAlign: 'left',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontWeight: 600,
          fontSize: '0.88rem',
        }}
      >
        <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <div className="animate-slide-up" style={{
      maxWidth: '780px',
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(217,70,239,0.15))',
          border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-full)',
          padding: '0.35rem 1rem', marginBottom: '1rem', fontSize: '0.8rem',
          fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.05em'
        }}>
          ✨ PERSONALIZATION SETUP — STEP {step + 1} OF {STEPS.length}
        </div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.4rem' }}>
          {currentStep.icon} {currentStep.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{currentStep.subtitle}</p>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', background: 'rgba(8,12,24,0.6)', borderRadius: 'var(--radius-full)', height: '8px', border: '1px solid var(--border-color)' }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.4s ease',
          boxShadow: '0 0 10px rgba(217,70,239,0.5)'
        }} />
      </div>

      {/* Step Content */}
      <div className="glass-card" style={{ padding: '2rem' }}>

        {/* Step 0: Category */}
        {step === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.75rem' }}>
            {CATEGORIES.map(c => (
              <SelectCard key={c.id} item={c} field="category" selectedValue={profile.category} />
            ))}
          </div>
        )}

        {/* Step 1: Education */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Highest Education Level</label>
              <select
                className="form-input"
                value={profile.education}
                onChange={e => handleSelect('education', e.target.value)}
                style={{ appearance: 'none' }}
              >
                <option value="">Select your education level...</option>
                <option value="10th">10th Class (SSC)</option>
                <option value="12th">12th Class (HSC / Intermediate)</option>
                <option value="diploma">Diploma</option>
                <option value="bachelor">Bachelor's Degree (B.E./B.Tech/BA/B.Com/BBA etc.)</option>
                <option value="master">Master's Degree (M.E./M.Tech/MBA/MA/M.Sc etc.)</option>
                <option value="phd">PhD / Research Scholar</option>
                <option value="iti">ITI Certificate</option>
                <option value="professional">Professional Degree (MBBS/LLB/CA/ARCH etc.)</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Field / Specialization (optional)</label>
              <input className="form-input" type="text" placeholder="e.g., Computer Science, Commerce, Law, Mechanical Engg..."
                value={profile.educationField} onChange={e => handleSelect('educationField', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Years of Work Experience</label>
              <select className="form-input" value={profile.experience} onChange={e => handleSelect('experience', e.target.value)} style={{ appearance: 'none' }}>
                <option value="">Select experience level...</option>
                <option value="Fresher">Fresher (0 years)</option>
                <option value="Less than 1 year">Less than 1 year</option>
                <option value="1-2 years">1–2 years</option>
                <option value="3-5 years">3–5 years</option>
                <option value="5-10 years">5–10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Domain */}
        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {DOMAINS.map(d => (
              <SelectCard key={d.id} item={d} field="domain" selectedValue={profile.domain} color={d.color} />
            ))}
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {GOALS.map(g => (
              <SelectCard key={g.id} item={g} field="goal" selectedValue={profile.goal} />
            ))}
          </div>
        )}

        {/* Step 4: Skills & Preferences */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Current Skills (comma-separated)</label>
              <textarea className="form-textarea" rows={3}
                placeholder="e.g., Python, React, Excel, AutoCAD, Legal Research, Tally, Photoshop..."
                value={profile.skills} onChange={e => handleSelect('skills', e.target.value)}
                style={{ resize: 'vertical' }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Preferred Location</label>
              <input className="form-input" type="text"
                placeholder="e.g., Hyderabad, Bangalore, Remote, Open to Relocation..."
                value={profile.location} onChange={e => handleSelect('location', e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Preferred Work Type</label>
              <select className="form-input" value={profile.workType} onChange={e => handleSelect('workType', e.target.value)} style={{ appearance: 'none' }}>
                <option value="">Select preference...</option>
                <option value="Full-time">Full-time Employment</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance / Consulting</option>
                <option value="Remote">Remote Work</option>
                <option value="Government">Government / PSU</option>
                <option value="Startup">Startup</option>
                <option value="Research">Research / Academia</option>
                <option value="Business">Own Business</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn btn-secondary"
          onClick={() => step > 0 ? setStep(s => s - 1) : null}
          disabled={step === 0}
          style={{ opacity: step === 0 ? 0.4 : 1, minWidth: '120px' }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? '24px' : '8px', height: '8px',
              borderRadius: 'var(--radius-full)',
              background: i <= step ? 'var(--color-primary)' : 'var(--border-color)',
              transition: 'all 0.3s ease'
            }} />
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canProceed()}
          style={{ minWidth: '140px', opacity: !canProceed() ? 0.5 : 1 }}
        >
          {step === STEPS.length - 1 ? '🚀 Get Started' : 'Continue →'}
        </button>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        You can update your preferences anytime from your Profile settings.
      </p>
    </div>
  );
}
