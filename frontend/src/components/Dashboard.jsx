export default function Dashboard({ data, onReset }) {
  if (!data) return null;

  const atsScore = data.atsScore ?? 0;
  const breakdown = data.breakdown || {};
  const keywordScore = breakdown.keywordScore ?? 0;
  const formattingScore = breakdown.formattingScore ?? 0;
  const readabilityScore = breakdown.readabilityScore ?? 0;

  const extractedProfile = data.extractedProfile || {};
  const detectedDomain = data.detectedDomain || extractedProfile.domain || 'General Professional';
  const profession = extractedProfile.profession || 'Professional';
  const experience = extractedProfile.experience || 'Not specified';
  const education = extractedProfile.education || 'Not specified';
  const skills = extractedProfile.skills || [];
  const projects = extractedProfile.projects || [];
  const certifications = extractedProfile.certifications || [];

  const employabilityAudit = data.employabilityAudit || {};
  const readiness = employabilityAudit.readiness || {};
  const projectDoctor = employabilityAudit.projectDoctor || [];
  const skillGaps = employabilityAudit.skillGaps || [];

  const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
  const strengths = Array.isArray(data.strengths) ? data.strengths : [];
  const weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses : [];
  const suitability = data.suitability || null;
  const warning = data.warning || '';

  const getScoreColor = (score) => {
    const s = score ?? 0;
    if (s >= 80) return 'var(--color-success)';
    if (s >= 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };
  const scoreColor = getScoreColor(atsScore);

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
      
      {/* 1. Profile Identity Banner */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)', borderTop: '4px solid var(--color-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>{profession}</h1>
            <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '1.1rem', marginTop: '0.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Sector: {detectedDomain}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-info" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
              Level: {readiness.verdict || experience}
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Experience: {experience}
            </p>
          </div>
        </div>
      </div>

      {warning && (
        <div className="badge badge-warning animate-fade-in" style={{ padding: '1rem', fontSize: '0.9rem' }}>
          ⚠️ {warning}
        </div>
      )}

      {/* 2. Suitability Verdict */}
      {suitability && verdictDetails && (
        <div className="glass-card" style={{ background: verdictDetails.bg, border: `1px solid ${verdictDetails.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🎯</span>
            <h2 style={{ color: verdictDetails.color, margin: 0 }}>{verdictDetails.label}</h2>
          </div>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>{suitability.summary}</p>
        </div>
      )}

      {/* 3. ATS Score & Breakdown Grid */}
      <div className="grid-2">
        {/* Modern ATS Score */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>ATS Fit Score</h3>
          <div style={{ position: 'relative', width: '150px', height: '150px', borderRadius: '50%', background: `conic-gradient(${scoreColor} ${atsScore}%, rgba(255,255,255,0.05) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${scoreColor}30` }}>
            <div style={{ position: 'absolute', width: '130px', height: '130px', borderRadius: '50%', background: 'var(--bg-surface-solid)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: scoreColor }}>{atsScore}%</span>
            </div>
          </div>
          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Based on {detectedDomain} industry standards
          </p>
        </div>

        {/* Breakdown Bars */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Score Breakdown</h3>
          {[
            { label: 'Keyword Alignment', score: keywordScore, color: 'var(--color-primary)' },
            { label: 'Structure & Format', score: formattingScore, color: 'var(--color-secondary)' },
            { label: 'Readability & Flow', score: readabilityScore, color: 'var(--color-accent)' }
          ].map(item => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span>{item.label}</span>
                <span style={{ color: item.color }}>{item.score}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${item.score}%`, height: '100%', background: item.color, borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Detailed Resume Breakdown */}
      <h3 style={{ fontSize: '1.5rem', marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Detailed Resume Breakdown</h3>
      <div className="grid-2">
        {/* Skills & Tech */}
        <div className="glass-card">
          <h4 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>🛠️ Identified Skills</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {skills.length > 0 ? skills.map((s, i) => <span key={i} className="badge" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>{s}</span>) : <span style={{color:'var(--text-muted)'}}>None detected</span>}
          </div>
        </div>

        {/* Education & Certs */}
        <div className="glass-card">
          <h4 style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}>🎓 Education & Certifications</h4>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{education}</p>
          {certifications.length > 0 && (
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {certifications.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
        </div>

        {/* Strengths */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <h4 style={{ color: 'var(--color-success)', marginBottom: '1rem' }}>🌟 Core Strengths</h4>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {strengths.length > 0 ? strengths.map((s, i) => <li key={i}>{s}</li>) : <li style={{color:'var(--text-muted)'}}>No specific strengths identified.</li>}
          </ul>
        </div>

        {/* Missing Skills & Weaknesses */}
        <div className="glass-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <h4 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>⚠️ Missing Industry Skills</h4>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {skillGaps.length > 0 
              ? skillGaps.map((g, i) => <li key={i}><strong>{g.missingSkill}</strong>: {g.importance}</li>)
              : weaknesses.map((w, i) => <li key={i}>{w}</li>)
            }
            {skillGaps.length === 0 && weaknesses.length === 0 && <li style={{color:'var(--color-success)'}}>No major gaps detected.</li>}
          </ul>
        </div>
      </div>

      {/* 5. Project & Experience Analysis */}
      {projectDoctor.length > 0 && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}>💼 Experience & Project Analysis</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projectDoctor.map((pd, i) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: pd.status === 'Good' ? '3px solid var(--color-success)' : '3px solid var(--color-warning)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{pd.originalProject}</strong>
                  <span className={`badge ${pd.status === 'Good' ? 'badge-success' : 'badge-warning'}`}>{pd.status}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{pd.feedback}</p>
                {pd.suggestedReplacement && pd.status !== 'Good' && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>Recommendation: {pd.suggestedReplacement.title}</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{pd.suggestedReplacement.description}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Actionable Improvements */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.4rem' }}>📋 Improvement Suggestions ({suggestions.length})</h3>
          <button className="btn btn-secondary" onClick={onReset} style={{ fontSize: '0.85rem' }}>🔄 Analyze Another</button>
        </div>
        {suggestions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>🎉 Perfect Resume! No issues found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {suggestions.map((suggestion, index) => {
              const badgeType = suggestion.severity === 'high' ? 'badge-danger' : suggestion.severity === 'medium' ? 'badge-warning' : 'badge-info';
              return (
                <div key={index} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <span className={`badge ${badgeType}`} style={{ textTransform: 'capitalize', flexShrink: 0, height: 'fit-content' }}>{suggestion.severity || 'medium'}</span>
                  <div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>{suggestion.message}</p>
                    <small style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>Category: {suggestion.category || 'general'}</small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
