import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass, Map, Loader, AlertTriangle, TrendingUp, Clock, DollarSign,
  ChevronRight, Sparkles, Target, Milestone, Zap, Brain, XCircle
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
};

export default function CareerHub({ user, apiKey, analysisResult }) {
  const [activeView, setActiveView] = useState('explore');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [targetRole, setTargetRole] = useState('');

  useEffect(() => {
    if (analysisResult?.extractedProfile?.profession) {
      const currentProfession = analysisResult.extractedProfile.profession;
      const experience = analysisResult.extractedProfile.experience || '';

      let suggestion = currentProfession;
      if (experience.toLowerCase().includes('fresher') || experience.toLowerCase().includes('0') || experience.toLowerCase().includes('intern')) {
        suggestion = `Junior ${currentProfession}`;
      } else {
        suggestion = `Senior ${currentProfession}`;
      }
      setTargetRole(suggestion);
    }
  }, [analysisResult]);

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

  const isGibberish = (text) => {
    const cleaned = text.trim().toLowerCase();
    if (cleaned.length < 2) return true;
    if (/(.)\\1{3,}/.test(cleaned)) return true;
    if (cleaned.length > 15 && !cleaned.includes(' ')) return true;

    const testWords = ['test', 'testing', 'asdf', 'qwer', 'zxcv', 'fake', 'dummy', 'rubbish', 'garbage', 'blah'];
    if (testWords.some(word => cleaned.includes(word))) return true;

    const alphanumericCount = (cleaned.match(/[a-z0-9]/g) || []).length;
    if (alphanumericCount < cleaned.length * 0.4) return true;

    return false;
  };

  const fetchRoadmap = async () => {
    const trimmedRole = targetRole.trim();
    if (!trimmedRole) return;

    if (isGibberish(trimmedRole)) {
      setData({ isValidRequest: false, validationMessage: "Please enter a valid career goal, skill, domain, or learning path." });
      return;
    }

    setLoading(true);
    setData(null);
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
          targetRole: trimmedRole
        })
      });
      const result = await res.json();

      if (!res.ok) {
        setData({ isValidRequest: false, validationMessage: result.error || "Please enter a valid career goal, skill, domain, or learning path." });
      } else {
        setData(result);
      }
    } catch (err) {
      console.error(err);
      setData({ isValidRequest: false, validationMessage: "A network error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'explore') {
      fetchExplore();
    } else if (activeView === 'roadmap' && targetRole && !data?.phases) {
      fetchRoadmap();
    } else {
      setData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <motion.header {...fadeUp} style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Brain size={32} style={{ color: 'var(--color-primary)' }} />
          Career Intelligence <span className="glow-text-gradient">Hub</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 700, margin: '0 auto' }}>
          AI-driven career pathways, personalized roadmaps, and domain insights tailored to your exact profession.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`btn ${activeView === 'explore' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveView('explore')}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Compass size={18} /> Career Exploration
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className={`btn ${activeView === 'roadmap' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveView('roadmap')}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Map size={18} /> Generate AI Roadmap
          </motion.button>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
              <Loader size={48} style={{ color: 'var(--color-primary)' }} />
            </motion.div>
            <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>Analyzing Career Landscape</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Generating customized insights for your profile...</p>
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card">

            {/* Explore View */}
            {activeView === 'explore' && data && (
              <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
                    {data.headline || 'Career Insights'}
                  </h2>
                  <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                    {data.summary}
                  </p>
                </div>

                {data.warning && (
                  <div className="badge badge-warning" style={{ padding: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={18} /> {data.warning}
                  </div>
                )}

                <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={20} style={{ color: 'var(--color-secondary)' }} /> Recommended Paths
                </h3>
                <div className="grid-2">
                  {(data.recommendedPaths || []).map((path, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{path.title}</h4>
                        <span className="badge badge-success" style={{ flexShrink: 0 }}>{path.match}% Match</span>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{path.reason}</p>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 8, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> Time to ready:</span>
                          <span>{path.timeToReady}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><DollarSign size={14} /> Avg Salary:</span>
                          <span style={{ color: 'var(--color-success)' }}>{path.averageSalary}</span>
                        </div>
                        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ChevronRight size={14} style={{ color: 'var(--color-primary)' }} />
                          <strong style={{ color: 'var(--color-primary)' }}>Next Step:</strong> {path.firstStep}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Roadmap View */}
            {activeView === 'roadmap' && (
              <motion.div {...fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Target size={14} /> Auto-Detected Target Role
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Senior Medical Officer, Lead Architect, etc."
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                    />
                  </div>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="btn btn-primary" onClick={fetchRoadmap} disabled={!targetRole}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={16} /> Generate Personalized Roadmap
                  </motion.button>
                </div>

                {data && data.isValidRequest === false && data.validationMessage && (
                  <motion.div {...fadeUp} className="badge badge-danger" style={{ padding: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <XCircle size={18} /> {data.validationMessage}
                  </motion.div>
                )}

                {data && data.isValidRequest !== false && data.targetRole && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', marginBottom: '1rem' }}>
                        Roadmap to {data.targetRole}
                      </h2>
                      <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{data.overview}</p>
                    </div>

                    {data.warning && (
                      <div className="badge badge-warning" style={{ padding: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={18} /> {data.warning}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative', paddingLeft: '1rem' }}>
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 26, width: 2, background: 'linear-gradient(180deg, var(--color-primary) 0%, var(--color-secondary) 100%)', opacity: 0.3 }} />

                      {(data.phases || []).map((phase, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.12 }}
                          style={{ position: 'relative', paddingLeft: '3rem' }}>
                          {/* Node marker */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: idx * 0.12 + 0.1, type: 'spring', stiffness: 300, damping: 15 }}
                            style={{
                              position: 'absolute', left: 0, top: '0.25rem',
                              width: 20, height: 20, borderRadius: '50%',
                              background: 'var(--bg-surface-solid)',
                              border: `4px solid ${idx % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)'}`,
                              boxShadow: '0 0 10px rgba(0,0,0,0.5)', zIndex: 2
                            }}
                          />

                          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>
                                Phase {phase.phase}: {phase.title}
                              </h3>
                              <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={13} /> {phase.duration}
                              </span>
                            </div>

                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                              <strong>Goal:</strong> {phase.goal}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                              {(phase.tasks || []).map((task, tidx) => (
                                <div key={tidx} style={{
                                  background: 'rgba(0,0,0,0.3)',
                                  border: '1px solid rgba(255,255,255,0.03)',
                                  padding: '1rem', borderRadius: 8,
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'
                                }}>
                                  <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{task.task}</span>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={13} /> {task.timeEstimate}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Milestone size={18} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                              <span><strong style={{ color: 'var(--color-success)' }}>Milestone:</strong> <span style={{ color: 'var(--text-secondary)' }}>{phase.milestone}</span></span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
