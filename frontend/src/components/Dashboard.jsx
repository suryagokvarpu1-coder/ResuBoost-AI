

export default function Dashboard({ data, onReset }) {
  if (!data) return null;

  const atsScore = data.atsScore ?? 0;
  const breakdown = data.breakdown || {};
  const keywordScore = breakdown.keywordScore ?? 0;
  const formattingScore = breakdown.formattingScore ?? 0;
  const readabilityScore = breakdown.readabilityScore ?? 0;

  const structure = data.structure || {};
  const sections = structure.sections || {};
  const emailFound = structure.emailFound ?? false;
  const phoneFound = structure.phoneFound ?? false;
  const linkedInFound = structure.linkedInFound ?? false;
  const gitHubFound = structure.gitHubFound ?? false;
  const experienceSectionFound = sections.experience ?? false;

  const metrics = data.metrics || {};
  const wordCount = metrics.wordCount ?? 0;
  const sentenceCount = metrics.sentenceCount ?? 0;
  const avgSentenceLength = metrics.avgSentenceLength ?? 0;
  const bulletCount = metrics.bulletCount ?? 0;

  const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
  const strengths = Array.isArray(data.strengths) ? data.strengths : [];
  const weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses : [];
  const suitability = data.suitability || null;
  const scannedProfiles = data.scannedProfiles || null;
  const isAI = data.isAI ?? false;
  const warning = data.warning || '';

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (atsScore / 100) * circumference;

  const getScoreColor = (score) => {
    const s = score ?? 0;
    if (s >= 80) return 'var(--color-success)';
    if (s >= 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const scoreColor = getScoreColor(atsScore);

  // Verdict design values
  const getVerdictDetails = (verdict) => {
    const v = verdict?.toLowerCase() || '';
    if (v.includes('highly suitable') || v === 'suitable') {
      return { label: 'Suitable Match', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)' };
    } else if (v.includes('partially') || v.includes('partial')) {
      return { label: 'Partial Match', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)' };
    }
    return { label: 'Low Match', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.25)' };
  };

  const verdictDetails = suitability ? getVerdictDetails(suitability.verdict) : null;

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Warning Alert if Offline Fallback */}
      {warning && (
        <div className="badge badge-warning animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
          <span>⚠️ {warning}</span>
        </div>
      )}

      {/* 1. Suitability Verdict Banner */}
      {suitability && verdictDetails && (
        <div 
          className="glass-card animate-fade-in"
          style={{
            background: verdictDetails.bg,
            border: `1px solid ${verdictDetails.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: `0 10px 30px 0 rgba(0, 0, 0, 0.3), 0 0 15px ${verdictDetails.color}10`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ 
              fontSize: '2rem', 
              color: verdictDetails.color,
              textShadow: `0 0 10px ${verdictDetails.color}40`
            }}>
              🎯
            </span>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: verdictDetails.color }}>
                {verdictDetails.label} Verdict
              </h2>
              <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                AI Candidate Suitability Matching
              </p>
            </div>
          </div>
          
          <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
            {suitability.summary || 'No compatibility summary generated.'}
          </p>

            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                🌐 Digital Footprint Alignment
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                {suitability.digitalFootprintAlignment || 'No digital footprint verification performed.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Score & Breakdown Grid */}
      <div className="grid-3">
        
        {/* Radial Score Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Match Score
          </h3>
          
          <div className="radial-progress-container">
            <svg className="radial-progress-svg">
              <defs>
                <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor={scoreColor} />
                </linearGradient>
              </defs>
              <circle className="radial-progress-bg" cx="90" cy="90" r={radius} />
              <circle 
                className="radial-progress-bar" 
                cx="90" 
                cy="90" 
                r={radius} 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="radial-progress-text">
              <span className="radial-score-val" style={{ textShadow: `0 0 15px ${scoreColor}20` }}>{atsScore}%</span>
              <span className="radial-score-label">ATS Fit</span>
            </div>
          </div>

          <p style={{ marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {atsScore >= 80 ? 'Excellent match! Strong resume fit.' : atsScore >= 50 ? 'Good potential, but needs tailoring.' : 'Low match score. Follow suggestions to improve.'}
          </p>
        </div>

        {/* Score Breakdown Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            ATS Criteria Breakdown
          </h3>

          {/* Keyword Match Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Keyword Alignment</span>
              <span style={{ fontWeight: 800, color: getScoreColor(keywordScore) }}>{keywordScore}%</span>
            </div>
            <div style={{ 
              height: '10px', 
              background: 'rgba(0, 0, 0, 0.45)', 
              borderRadius: '5px', 
              boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.6)', 
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>
              <div style={{ 
                width: `${keywordScore}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-primary) 0%, #60a5fa 100%)', 
                borderRadius: '5px', 
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
                transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' 
              }} />
            </div>
          </div>

          {/* Formatting Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Structure & Format</span>
              <span style={{ fontWeight: 800, color: getScoreColor(formattingScore) }}>{formattingScore}%</span>
            </div>
            <div style={{ 
              height: '10px', 
              background: 'rgba(0, 0, 0, 0.45)', 
              borderRadius: '5px', 
              boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.6)', 
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>
              <div style={{ 
                width: `${formattingScore}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-secondary) 0%, #f472b6 100%)', 
                borderRadius: '5px', 
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
                transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' 
              }} />
            </div>
          </div>

          {/* Readability Progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Readability & Flow</span>
              <span style={{ fontWeight: 800, color: getScoreColor(readabilityScore) }}>{readabilityScore}%</span>
            </div>
            <div style={{ 
              height: '10px', 
              background: 'rgba(0, 0, 0, 0.45)', 
              borderRadius: '5px', 
              boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.6)', 
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>
              <div style={{ 
                width: `${readabilityScore}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-accent) 0%, #22d3ee 100%)', 
                borderRadius: '5px', 
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
                transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' 
              }} />
            </div>
          </div>
        </div>

        {/* Structural Checklist Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            Essentials Checklist
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem' }}>
            {[
              { label: 'Email Address', found: emailFound },
              { label: 'Phone Number', found: phoneFound },
              { label: 'LinkedIn Profile', found: linkedInFound },
              { label: 'GitHub Profile', found: gitHubFound },
              { label: 'Experience Section', found: experienceSectionFound }
            ].map((item, idx) => (
              <div 
                key={idx}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.6rem 0.85rem',
                  background: 'rgba(0, 0, 0, 0.25)',
                  boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.03)',
                  transition: 'transform 0.2s ease'
                }}
                className="checklist-item-3d"
              >
                <span style={{ 
                  fontSize: '1rem', 
                  color: item.found ? 'var(--color-success)' : 'var(--color-danger)',
                  filter: `drop-shadow(0 0 4px ${item.found ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'})`,
                  fontWeight: 'bold'
                }}>
                  {item.found ? '✓' : '✗'}
                </span>
                <span style={{ 
                  fontWeight: 600, 
                  color: item.found ? 'var(--text-primary)' : 'var(--text-muted)' 
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Scanned Social Profiles Widgets */}
      {scannedProfiles && (
        <div>
          <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>
            🔍 Real-Time Profile Scan Reports
          </h3>
          
          <div className="grid-2">
            
            {/* Professional Profile Box */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>👔</span> AI Reconstructed Professional Profile
                </h4>
                {scannedProfiles.professionalProfile ? (
                  <span className="badge badge-info">Verified Match ✓</span>
                ) : (
                  <span className="badge badge-warning">No Profile Detected</span>
                )}
              </div>

              {scannedProfiles.professionalProfile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <h5 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>
                      {scannedProfiles.professionalProfile.headline || 'Professional'}
                    </h5>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <span>Sector: {scannedProfiles.professionalProfile.industry || 'Unknown'}</span>
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.02)', border: '1px dashed var(--border-color)', borderRadius: '6px', marginTop: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <span>Reconstructed Executive Summary</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {scannedProfiles.professionalProfile.summary || 'No professional overview generated.'}
                    </p>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1.5rem 0', textAlign: 'center' }}>
                  Could not reconstruct a generic professional profile from this resume. Ensure clear domain keywords are present.
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* AI Insights: Strengths & Weaknesses (Only if AI key used) */}
      {isAI && (strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid-2">
          
          {/* Strengths Card */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--color-success)' }}>🟢</span> Key Strengths
            </h3>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>

          {/* Weaknesses Card */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--color-danger)' }}>🔴</span> Gaps Detected
            </h3>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {weaknesses.map((weak, idx) => (
                <li key={idx}>{weak}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Suggestions List */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)' }}>
            📋 Actionable Recommendations ({suggestions.length})
          </h3>
          <button className="btn btn-secondary" onClick={onReset} style={{ fontSize: '0.85rem' }}>
            🔄 Analyze Another Resume
          </button>
        </div>

        {suggestions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            🎉 Perfect Resume! No issues or optimization suggestions found.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {suggestions.map((suggestion, index) => {
              const badgeType = 
                suggestion.severity === 'high' ? 'badge-danger' : 
                suggestion.severity === 'medium' ? 'badge-warning' : 'badge-info';
              
              return (
                <div 
                  key={index} 
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <span className={`badge ${badgeType}`} style={{ textTransform: 'capitalize', flexShrink: 0, marginTop: '2px' }}>
                    {suggestion.severity || 'medium'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{suggestion.message || 'Optimize your resume sections.'}</p>
                    <small style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Category: {suggestion.category || 'general'}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Metrics Card */}
      <div className="glass-card grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
        <div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Word Count</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>{wordCount}</p>
        </div>
        <div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Sentence Count</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-secondary)' }}>{sentenceCount}</p>
        </div>
        <div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Avg Sentence</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>{avgSentenceLength} words</p>
        </div>
        <div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Bullet Count</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>{bulletCount}</p>
        </div>
      </div>

    </div>
  );
}
