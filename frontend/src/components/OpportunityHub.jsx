import { useState, useEffect } from 'react';

export default function OpportunityHub({ user, apiKey, analysisResult }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTip, setSearchTip] = useState('');
  const [profileGap, setProfileGap] = useState('');

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const activeProfile = analysisResult?.extractedProfile || user?.preferences || { domain: 'general_professional', profession: 'Professional' };
        
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
        if (result.searchTip) setSearchTip(result.searchTip);
        if (result.profileGap) setProfileGap(result.profileGap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, [user, apiKey, analysisResult]);

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
          Opportunity <span className="glow-text-gradient">Hub</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
          Jobs, internships, freelance gigs, and government schemes accurately matched to your profession and domain.
        </p>
      </header>

      {loading ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', border: '4px solid rgba(59, 130, 246, 0.1)', borderTop: '4px solid var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>Finding Perfect Matches...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Cross-referencing your skills and domain against market opportunities.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {(searchTip || profileGap) && (
            <div className="grid-2">
              {searchTip && (
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-info)' }}>
                  <h4 style={{ color: 'var(--color-info)', marginBottom: '0.5rem' }}>💡 Search Tip</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{searchTip}</p>
                </div>
              )}
              {profileGap && (
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-warning)' }}>
                  <h4 style={{ color: 'var(--color-warning)', marginBottom: '0.5rem' }}>🎯 Profile Optimization</h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{profileGap}</p>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {opportunities.map((opp, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `4px solid ${opp.isGovernment ? '#eab308' : 'var(--color-primary)'}` }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>{opp.title}</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-secondary)', fontSize: '1rem', fontWeight: 600 }}>{opp.company}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
                      {opp.matchScore}% Match
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>📍 {opp.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>💰 {opp.salary}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>⏱️ {opp.experience}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: opp.isGovernment ? '#eab308' : 'var(--color-primary)', fontWeight: 600 }}>
                    🏢 {opp.type}
                  </span>
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {opp.description}
                </p>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Why It Matches You:</strong>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{opp.matchReason}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(opp.skills || []).map((s, i) => (
                      <span key={i} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', whiteSpace: 'nowrap' }}>
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
