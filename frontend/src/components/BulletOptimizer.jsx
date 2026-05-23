import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sparkles, Copy, Check, FileText, Send, BarChart3, Star, Zap, Loader, AlertTriangle, Brain } from 'lucide-react';

const variantConfig = [
  { key: 'actionOriented', label: 'Action-Oriented', color: 'var(--color-primary)', icon: Zap, description: 'Strong action verbs with direct impact' },
  { key: 'metricFocused', label: 'Metric-Focused', color: 'var(--color-success)', icon: BarChart3, description: 'Quantified results and measurable outcomes' },
  { key: 'starFormat', label: 'STAR Method', color: 'var(--color-secondary)', icon: Star, description: 'Situation → Task → Action → Result format' },
];

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
      if (apiKey) headers['x-api-key'] = apiKey;

      const response = await fetch('/api/optimize-bullet', {
        method: 'POST',
        headers,
        body: JSON.stringify({ bulletPoint, jobDescription })
      });

      if (!response.ok) throw new Error('Server failed to optimize bullet point.');
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-col gap-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}
        >
          <span className="flex-center gap-3" style={{ justifyContent: 'center' }}>
            <Target size={28} style={{ color: 'var(--color-primary)' }} />
            AI <span className="glow-text-gradient">Bullet Optimizer</span>
          </span>
        </motion.h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '550px', margin: '0 auto' }}>
          Transform weak bullet points into high-impact, ATS-optimized statements.
        </p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="badge badge-danger"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', width: '100%', textTransform: 'none', letterSpacing: 0 }}
          >
            <AlertTriangle size={16} /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="glass-card glass-card-static"
        >
          <div className="section-header" style={{ marginBottom: 'var(--space-5)' }}>
            <div className="section-icon"><FileText size={20} /></div>
            <div>
              <div className="section-title" style={{ fontSize: '1.1rem' }}>Optimization Input</div>
              <div className="section-subtitle">Paste your bullet point & optional JD</div>
            </div>
          </div>

          <form onSubmit={handleOptimize} className="flex-col gap-5">
            <div className="form-group" style={{ margin: 0 }}>
              <div className="flex-between mb-2">
                <label className="form-label" htmlFor="bullet-input" style={{ margin: 0 }}>Resume Bullet Point</label>
                {bulletPoint && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{bulletPoint.length} chars</span>}
              </div>
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
              <label className="form-label" htmlFor="jd-input">Target Job Description (Optional)</label>
              <textarea
                id="jd-input"
                className="form-textarea"
                placeholder="Paste a job description for keyword-targeted rewrites..."
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <motion.button
              type="submit" className="btn btn-primary w-full" style={{ padding: '0.85rem' }}
              disabled={loading} whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex-center gap-2"><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Optimizing...</span>
              ) : (
                <span className="flex-center gap-2"><Sparkles size={16} /> Rewrite Bullet Point</span>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="flex-col gap-4"
        >
          {loading ? (
            // Loading skeleton
            <div className="glass-card glass-card-static flex-center flex-col gap-4" style={{ padding: 'var(--space-16) var(--space-8)' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <Brain size={36} style={{ color: 'var(--color-secondary)' }} />
              </motion.div>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Generating high-impact alternatives...</p>
              <div className="flex-col gap-3 w-full" style={{ marginTop: 'var(--space-4)' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton skeleton-card" style={{ height: '80px' }} />
                ))}
              </div>
            </div>
          ) : results ? (
            <>
              {/* AI/Offline indicator */}
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className={`badge ${results.isAI ? 'badge-info' : 'badge-accent'}`}
                style={{ padding: 'var(--space-2) var(--space-4)', fontSize: '0.8rem', textTransform: 'none', letterSpacing: 0 }}
              >
                {results.isAI ? <Sparkles size={13} /> : <Zap size={13} />}
                {results.isAI ? 'Powered by Gemini AI' : 'Generated with local templates'}
              </motion.div>

              {/* Result Cards */}
              {variantConfig.map(({ key, label, color, icon: Icon, description }, idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-card glass-card-sm glass-card-static"
                  style={{ borderLeft: `3px solid ${color}` }}
                >
                  <div className="flex-between" style={{ marginBottom: 'var(--space-3)' }}>
                    <div className="flex-center gap-2">
                      <Icon size={16} style={{ color }} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {label}
                      </span>
                    </div>
                    <motion.button
                      onClick={() => handleCopy(results[key], key)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', gap: '4px' }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copiedText === key ? (
                        <><Check size={13} style={{ color: 'var(--color-success)' }} /> Copied</>
                      ) : (
                        <><Copy size={13} /> Copy</>
                      )}
                    </motion.button>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: key === 'starFormat' ? 'pre-line' : 'normal' }}>
                    {results[key]}
                  </p>
                </motion.div>
              ))}
            </>
          ) : (
            <div className="glass-card glass-card-static flex-center flex-col gap-4 text-center" style={{ padding: 'var(--space-16) var(--space-8)' }}>
              <Sparkles size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)' }}>Your optimized bullet points will appear here.</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
