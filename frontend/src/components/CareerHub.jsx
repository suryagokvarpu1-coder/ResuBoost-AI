import { useState, useEffect } from 'react';

export default function CareerHub({ user, apiKey, analysisResult }) {
  const [activeView, setActiveView] = useState('explore');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [targetRole, setTargetRole] = useState('');

  const fetchExplore = async () => {
    setLoading(true);
    try {
      const activeProfile = analysisResult?.extractedProfile || user?.preferences || { domain: 'general_professional', profession: 'Professional', experience: 'Fresher' };
      const res = await fetch('/api/career/explore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ userProfile: activeProfile })
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmap = async () => {
    if (!targetRole) return;
    setLoading(true);
    try {
      const activeProfile = analysisResult?.extractedProfile || user?.preferences || { domain: 'general_professional', profession: 'Professional', experience: 'Fresher' };
      const res = await fetch('/api/career/roadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || ''
        },
        body: JSON.stringify({ 
          userProfile: activeProfile,
          targetRole 
        })
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'explore') {
      fetchExplore();
    } else {
      setData(null);
    }
  }, [activeView]);

  return (
    <div className="dashboard-container animate-fade-in" style={{ padding: '2rem' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="glow-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Career Intelligence Hub</h1>
        <p style={{ color: 'var(--text-secondary)' }}>AI-driven career pathways, roadmaps, and domain insights.</p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button 
            className={`btn ${activeView === 'explore' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveView('explore')}
          >
            🧭 Career Exploration
          </button>
          <button 
            className={`btn ${activeView === 'roadmap' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveView('roadmap')}
          >
            🗺️ Generate AI Roadmap
          </button>
        </div>
      </header>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--color-primary)' }}>Analyzing career landscape...</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          {activeView === 'explore' && data && (
            <div className="animate-slide-up">
              <h2 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                {data.headline || 'Career Insights'}
              </h2>
              <p style={{ lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '2rem' }}>
                {data.summary}
              </p>
              
              {data.warning && (
                <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderLeft: '4px solid #eab308', borderRadius: '4px', marginBottom: '2rem', color: '#fef08a' }}>
                  ⚠️ {data.warning}
                </div>
              )}

              <h3 style={{ marginBottom: '1rem' }}>Recommended Paths</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {(data.recommendedPaths || []).map((path, idx) => (
                  <div key={idx} className="metric-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-secondary)' }}>{path.title}</h4>
                      <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80' }}>
                        {path.match}% Match
                      </span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{path.reason}</p>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong>Time to ready:</strong> {path.timeToReady}<br/>
                      <strong>Avg Salary:</strong> {path.averageSalary}<br/>
                      <strong style={{ color: 'var(--color-primary)', display: 'block', marginTop: '0.5rem' }}>Next Step: {path.firstStep}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeView === 'roadmap' && (
            <div className="animate-slide-up">
              <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Target Role / Goal</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Senior Machine Learning Engineer" 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <button className="btn btn-primary" onClick={fetchRoadmap} disabled={!targetRole}>
                  Generate Roadmap
                </button>
              </div>

              {data && (
                <div>
                  <h2 style={{ color: 'var(--color-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    Roadmap to {data.targetRole}
                  </h2>
                  <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>{data.overview}</p>
                  
                  {data.warning && (
                    <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderLeft: '4px solid #eab308', borderRadius: '4px', marginBottom: '2rem', color: '#fef08a' }}>
                      ⚠️ {data.warning}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {(data.phases || []).map((phase, idx) => (
                      <div key={idx} style={{ 
                        position: 'relative', 
                        paddingLeft: '2rem',
                        borderLeft: '2px solid var(--color-primary)'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '-11px',
                          top: '0',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'var(--bg-card)',
                          border: '4px solid var(--color-primary)'
                        }}></div>
                        
                        <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          Phase {phase.phase}: {phase.title}
                          <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontWeight: 'normal' }}>
                            {phase.duration}
                          </span>
                        </h3>
                        <p style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}>Goal: {phase.goal}</p>
                        
                        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
                          {(phase.tasks || []).map((task, tidx) => (
                            <div key={tidx} style={{ 
                              background: 'rgba(0,0,0,0.2)', 
                              padding: '0.75rem', 
                              borderRadius: '4px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{ fontSize: '0.9rem' }}>• {task.task}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.timeEstimate}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '4px' }}>
                          <strong style={{ color: '#60a5fa' }}>Milestone:</strong> {phase.milestone}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
