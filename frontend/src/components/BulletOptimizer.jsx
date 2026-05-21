import { useState } from 'react';

export default function BulletOptimizer({ apiKey, defaultJd = '' }) {
  const [bulletPoint, setBulletPoint] = useState('');
  const [jobDescription, setJobDescription] = useState(defaultJd);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [copiedText, setCopiedText] = useState('');
  const [error, setError] = useState('');

  const handleOptimize = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!bulletPoint.trim()) {
      setError('Please paste a resume bullet point to optimize.');
      return;
    }

    setLoading(true);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }

      const response = await fetch('/api/optimize-bullet', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          bulletPoint,
          jobDescription
        })
      });

      if (!response.ok) {
        throw new Error('Server failed to optimize bullet point.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to connect to bullet optimizer service.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(''), 2000);
  };

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Intro Banner */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.5rem' }}>
          🎯 AI <span className="glow-text-gradient">Bullet Point Optimizer</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Paste a single weak bullet point from your resume. Get three professionally rewritten, impact-driven alternatives.
        </p>
      </div>

      {error && (
        <div className="badge badge-danger animate-fade-in" style={{ display: 'block', padding: '0.75rem', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Sandbox Grid */}
      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        
        {/* Left Side: Inputs */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '1.25rem' }}>
            Optimization Sandbox
          </h3>

          <form onSubmit={handleOptimize} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="bullet-input">Your Resume Bullet Point</label>
              <textarea
                id="bullet-input"
                className="form-textarea"
                placeholder="e.g. Worked on the backend code and fixed bugs..."
                rows={4}
                value={bulletPoint}
                onChange={(e) => setBulletPoint(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="jd-input">Target Job Description (Optional context)</label>
              <textarea
                id="jd-input"
                className="form-textarea"
                placeholder="Paste the job description here to tailor rewrite keywords..."
                rows={5}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
              {loading ? 'Optimizing Bullet...' : '✨ Rewrite Bullet Point'}
            </button>
          </form>
        </div>

        {/* Right Side: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div className="glass-card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '6rem 2rem', 
              gap: '1rem',
              height: '100%'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(168, 85, 247, 0.1)',
                borderTop: '3px solid var(--color-secondary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <p style={{ color: 'var(--text-secondary)' }}>Generating high-impact alternatives...</p>
            </div>
          ) : results ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Info banner about AI / Offline */}
              <div className="badge badge-info" style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                <span>{results.isAI ? '🤖 Powered by Gemini 1.5 Flash' : '🔌 Generated locally using pre-compiled action verbiage templates.'}</span>
              </div>

              {/* Action-Oriented */}
              <div className="glass-card" style={{ position: 'relative', borderLeft: '3px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                    Option 1: Action-Oriented
                  </span>
                  <button 
                    onClick={() => handleCopy(results.actionOriented, 'action')}
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    {copiedText === 'action' ? 'Copied! ✓' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {results.actionOriented}
                </p>
              </div>

              {/* Metric-Focused */}
              <div className="glass-card" style={{ position: 'relative', borderLeft: '3px solid var(--color-success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-success)', textTransform: 'uppercase' }}>
                    Option 2: Metric-Focused
                  </span>
                  <button 
                    onClick={() => handleCopy(results.metricFocused, 'metric')}
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    {copiedText === 'metric' ? 'Copied! ✓' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                  {results.metricFocused}
                </p>
              </div>

              {/* STAR Method */}
              <div className="glass-card" style={{ position: 'relative', borderLeft: '3px solid var(--color-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-secondary)', textTransform: 'uppercase' }}>
                    Option 3: STAR Method
                  </span>
                  <button 
                    onClick={() => handleCopy(results.starFormat, 'star')}
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                  >
                    {copiedText === 'star' ? 'Copied! ✓' : 'Copy'}
                  </button>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                  {results.starFormat}
                </p>
              </div>

            </div>
          ) : (
            <div className="glass-card" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              textAlign: 'center', 
              padding: '6rem 2rem', 
              color: 'var(--text-secondary)',
              height: '100%'
            }}>
              <div>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>✨</span>
                <p>Your optimized bullet points will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
