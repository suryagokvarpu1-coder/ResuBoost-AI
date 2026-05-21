

export default function EmployabilityAudit({ data }) {
  if (!data || !data.employabilityAudit) {
    return (
      <div className="glass-card text-center" style={{ padding: '3rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          No employability audit available. Please upload a resume and run the audit first!
        </p>
      </div>
    );
  }

  const audit = data.employabilityAudit || {};
  
  const universityExposure = audit.universityExposure || {};
  const reputationScore = universityExposure.reputationScore ?? 50;
  const brandingVerdict = universityExposure.brandingVerdict || 'N/A';
  const careerOpportunities = universityExposure.careerOpportunities || 'N/A';

  const readiness = audit.readiness || {};
  const verdict = readiness.verdict || 'Internship';
  const rating = readiness.rating ?? 50;
  const rationale = readiness.rationale || 'N/A';

  const projectDoctor = Array.isArray(audit.projectDoctor) ? audit.projectDoctor : [];
  const skillGaps = Array.isArray(audit.skillGaps) ? audit.skillGaps : [];
  const portfolioTips = Array.isArray(audit.portfolioTips) ? audit.portfolioTips : [];

  // Helpers for styling
  const getReadinessColor = (verd) => {
    const v = (verd || '').toLowerCase();
    if (v.includes('full-time') && !v.includes('junior')) return 'var(--color-success)';
    if (v.includes('junior')) return 'var(--color-primary)';
    return 'var(--color-accent)';
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'good': return 'var(--color-success)';
      case 'overused': return 'var(--color-warning)';
      case 'outdated': return 'var(--color-danger)';
      default: return 'var(--text-secondary)';
    }
  };

  const getImportanceColor = (imp) => {
    const i = (imp || '').toLowerCase();
    switch (i) {
      case 'critical': return 'var(--color-danger)';
      case 'highly recommended': return 'var(--color-warning)';
      default: return 'var(--color-primary)';
    }
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Hero section: Readiness and College Brand */}
      <div className="grid-2">
        
        {/* Placement / Career Readiness */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
              Career Readiness Verdict
            </h3>
            <span 
              className="badge" 
              style={{ 
                background: `${getReadinessColor(verdict)}15`, 
                color: getReadinessColor(verdict),
                border: `1px solid ${getReadinessColor(verdict)}30`,
                fontSize: '0.9rem',
                fontWeight: 700
              }}
            >
              🎓 Suitable for: {verdict}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              {/* Circular Meter */}
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="none" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="32" 
                  stroke={getReadinessColor(verdict)} 
                  strokeWidth="6" 
                  fill="none" 
                  strokeDasharray={2 * Math.PI * 32}
                  strokeDashoffset={2 * Math.PI * 32 - (rating / 100) * (2 * Math.PI * 32)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s' }}
                />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                {rating}%
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>Employability Index Score</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Based on your current skill sets, project complexities, and work history duration.
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
            <strong>Analysis:</strong> {rationale}
          </p>
        </div>

        {/* University Reputation & Exposure */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
            🏫 College Reputation & Placement Exposure
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <span>University Branding Power</span>
                <strong style={{ color: 'var(--color-primary)' }}>{reputationScore}/100</strong>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${reputationScore}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: '3px' }} />
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Campus Footprint</span>
                <p style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 500 }}>
                  {brandingVerdict}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block' }}>Placement Opportunities & Exposure</span>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {careerOpportunities}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Project Doctor Section */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
          👨‍⚕️ Project Doctor (Portfolio Code Clinic)
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          We audited your projects to identify if they are outdated, overused, or low-demand in modern corporate hiring, and designed custom innovative upgrades.
        </p>

        {projectDoctor.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            No projects detected in the resume text to audit. Ensure projects are clearly formatted under headings!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {projectDoctor.map((proj, idx) => {
              if (!proj) return null;
              
              const status = proj.status || 'Good';
              const originalProject = proj.originalProject || 'Unnamed Project';
              const feedback = proj.feedback || 'Looks like a standard portfolio project.';
              const suggestedReplacement = proj.suggestedReplacement;
              const techStack = suggestedReplacement?.techStack || '';
              const techList = typeof techStack === 'string' ? techStack.split(',').filter(Boolean) : [];

              return (
                <div 
                  key={idx} 
                  style={{ 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                      📁 Project: <span style={{ color: 'var(--color-primary)' }}>{originalProject}</span>
                    </h4>
                    <span 
                      className="badge" 
                      style={{ 
                        background: `${getStatusColor(status)}15`, 
                        color: getStatusColor(status),
                        border: `1px solid ${getStatusColor(status)}30`,
                        fontWeight: 700
                      }}
                    >
                      {status} Quality
                    </span>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    <strong>Diagnosis:</strong> {feedback}
                  </p>

                  {/* Replacement Recommendation */}
                  {suggestedReplacement && (
                    <div 
                      style={{ 
                        background: 'rgba(168, 85, 247, 0.02)', 
                        border: '1px dashed rgba(168, 85, 247, 0.25)', 
                        borderRadius: '8px', 
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          💡 Suggested Professional Replacement
                        </span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          High Recruiter Appeal
                        </span>
                      </div>
                      
                      <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                        🚀 {suggestedReplacement.title || 'Advanced Project Replacement'}
                      </h5>
                      
                      {techList.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {techList.map((tech, tIdx) => (
                            <span key={tIdx} style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginTop: '0.2rem' }}>
                        {suggestedReplacement.description || 'No description provided.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Skill Gaps & Portfolio Optimization Grid */}
      <div className="grid-2">
        
        {/* Skill Gap Analysis */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
              🛠️ Skill Gap Analysis
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Most critical technical skills missing from your resume that are in high demand in today's job market.
            </p>
          </div>

          {skillGaps.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0' }}>
              No critical skill gaps identified. Excellent job!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {skillGaps.map((gap, idx) => {
                if (!gap) return null;
                const recommendedTools = Array.isArray(gap.recommendedTools) ? gap.recommendedTools : [];
                return (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: '0.85rem', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                        {gap.missingSkill || 'Technical Skill Gap'}
                      </span>
                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          color: getImportanceColor(gap.importance || 'Optional'), 
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}
                      >
                        {gap.importance || 'Optional'}
                      </span>
                    </div>

                    {recommendedTools.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center', marginTop: '0.1rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Learn tools: </span>
                        {recommendedTools.map((tool, tIdx) => (
                          <span key={tIdx} style={{ fontSize: '0.75rem', padding: '0.1rem 0.35rem', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', borderRadius: '4px' }}>
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Portfolio & LinkedIn Tips */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem' }}>
              📈 Brand Optimization Strategy
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Concrete steps to build your online footprint, attract tech recruiters, and bypass resume filters.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {portfolioTips.map((tip, idx) => {
              if (!tip) return null;
              return (
                <div 
                  key={idx} 
                  style={{ 
                    padding: '0.85rem', 
                    background: 'rgba(255,255,255,0.01)', 
                    borderLeft: '3px solid var(--color-primary)', 
                    borderRadius: '0 8px 8px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {tip.category || 'General Tip'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#fff', lineHeight: '1.4' }}>
                    {tip.tip || ''}
                  </p>
                  {tip.actionItem && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <strong>Action item:</strong> <span style={{ color: 'var(--color-secondary)' }}>{tip.actionItem}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
