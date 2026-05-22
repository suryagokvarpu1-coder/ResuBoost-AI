import { useState, useEffect } from 'react';

export default function OpportunityHub({ user, apiKey, analysisResult }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const activeProfile = analysisResult?.extractedProfile || user?.preferences || { domain: 'software_it' };
        
        const res = await fetch('/api/opportunities/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey || ''
          },
          body: JSON.stringify({ userProfile: activeProfile, opportunityType: 'all' })
        });
        const result = await res.json();
        setOpportunities(result.opportunities || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, [user, apiKey]);

  return (
    <div className="dashboard-container animate-fade-in" style={{ padding: '2rem' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="glow-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Opportunity Hub</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Jobs, internships, freelance gigs, and government schemes matched to your profile.</p>
      </header>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--color-primary)' }}>Finding matches...</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {opportunities.map((opp, idx) => (
              <div key={idx} className="metric-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `4px solid ${opp.isGovernment ? '#eab308' : 'var(--color-primary)'}` }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>{opp.title}</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-secondary)', fontSize: '0.95rem' }}>{opp.company}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
                      {opp.matchScore}% Match
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>📍 {opp.location}</span>
                  <span>💰 {opp.salary}</span>
                  <span>⏱️ {opp.experience}</span>
                  <span style={{ color: opp.isGovernment ? '#eab308' : 'var(--color-primary)' }}>🏢 {opp.type}</span>
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {opp.description}
                </p>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem' }}>WHY IT MATCHES YOU:</strong>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{opp.matchReason}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(opp.skills || []).map((s, i) => (
                      <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
                    Apply via {opp.applyVia}
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
