import { motion } from 'framer-motion';
import {
  GraduationCap, Award, TrendingUp, AlertTriangle, CheckCircle, XCircle,
  Wrench, Lightbulb, Code2, Rocket, Star, Building2, BarChart3,
  Stethoscope, Target, Layers, BookOpen, Zap
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
};

const CircularMeter = ({ value, color, size = 80 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.03)" strokeWidth={6} fill="none" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={6} fill="none"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
        {value}%
      </div>
    </div>
  );
};

export default function EmployabilityAudit({ data }) {
  if (!data || !data.employabilityAudit) {
    return (
      <motion.div {...fadeUp} className="glass-card text-center" style={{ padding: '3rem' }}>
        <GraduationCap size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>
          No employability audit available. Please upload a resume and run the audit first!
        </p>
      </motion.div>
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

  const getReadinessColor = (verd) => {
    const v = (verd || '').toLowerCase();
    if (v.includes('full-time') && !v.includes('junior')) return '#10b981';
    if (v.includes('junior')) return 'var(--color-primary)';
    return 'var(--color-accent)';
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'good': return '#10b981';
      case 'overused': return '#f59e0b';
      case 'outdated': return '#f43f5e';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'good': return <CheckCircle size={16} style={{ color: '#10b981' }} />;
      case 'overused': return <AlertTriangle size={16} style={{ color: '#f59e0b' }} />;
      case 'outdated': return <XCircle size={16} style={{ color: '#f43f5e' }} />;
      default: return <BarChart3 size={16} style={{ color: 'var(--text-secondary)' }} />;
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Hero: Readiness and College Brand */}
      <div className="grid-2">

        {/* Career Readiness */}
        <motion.div {...fadeUp} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} /> Career Readiness Verdict
            </h3>
            <span
              className="badge"
              style={{
                background: `${getReadinessColor(verdict)}15`,
                color: getReadinessColor(verdict),
                border: `1px solid ${getReadinessColor(verdict)}30`,
                fontSize: '0.9rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Award size={14} /> Suitable for: {verdict}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.5rem' }}>
            <CircularMeter value={rating} color={getReadinessColor(verdict)} />
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <BarChart3 size={16} style={{ color: 'var(--color-primary)' }} /> Employability Index Score
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Based on your current skill sets, project complexities, and work history duration.
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.5', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
            <strong>Analysis:</strong> {rationale}
          </p>
        </motion.div>

        {/* University Reputation */}
        <motion.div {...fadeUp} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} /> College Reputation & Placement Exposure
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star size={14} style={{ color: 'var(--color-primary)' }} /> University Branding Power</span>
                <strong style={{ color: 'var(--color-primary)' }}>{reputationScore}/100</strong>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${reputationScore}%` }}
                  transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', borderRadius: 3 }}
                />
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Layers size={12} /> Campus Footprint
                </span>
                <p style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 500 }}>{brandingVerdict}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={12} /> Placement Opportunities & Exposure
                </span>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{careerOpportunities}</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Project Doctor */}
      <motion.div {...fadeUp} className="glass-card">
        <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Stethoscope size={24} style={{ color: 'var(--color-secondary)' }} /> Project Doctor (Portfolio Code Clinic)
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
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    display: 'flex', flexDirection: 'column', gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Code2 size={18} style={{ color: 'var(--color-primary)' }} />
                      Project: <span style={{ color: 'var(--color-primary)' }}>{originalProject}</span>
                    </h4>
                    <span
                      className="badge"
                      style={{
                        background: `${getStatusColor(status)}15`,
                        color: getStatusColor(status),
                        border: `1px solid ${getStatusColor(status)}30`,
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      {getStatusIcon(status)} {status} Quality
                    </span>
                  </div>

                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    <strong>Diagnosis:</strong> {feedback}
                  </p>

                  {suggestedReplacement && (
                    <div style={{
                      background: 'rgba(168, 85, 247, 0.02)',
                      border: '1px dashed rgba(168, 85, 247, 0.25)',
                      borderRadius: 8, padding: '1rem',
                      display: 'flex', flexDirection: 'column', gap: '0.6rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Lightbulb size={14} /> Suggested Professional Replacement
                        </span>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.5rem', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Zap size={12} style={{ color: 'var(--color-warning)' }} /> High Recruiter Appeal
                        </span>
                      </div>

                      <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Rocket size={16} style={{ color: 'var(--color-primary)' }} />
                        {suggestedReplacement.title || 'Advanced Project Replacement'}
                      </h5>

                      {techList.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {techList.map((tech, tIdx) => (
                            <span key={tIdx} style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)' }}>
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
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Skill Gaps & Portfolio Tips */}
      <div className="grid-2">

        {/* Skill Gap Analysis */}
        <motion.div {...fadeUp} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wrench size={20} style={{ color: 'var(--color-accent)' }} /> Skill Gap Analysis
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Most critical technical skills missing from your resume that are in high demand in today's job market.
            </p>
          </div>

          {skillGaps.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <CheckCircle size={16} style={{ color: 'var(--color-success)' }} /> No critical skill gaps identified. Excellent job!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {skillGaps.map((gap, idx) => {
                if (!gap) return null;
                const recommendedTools = Array.isArray(gap.recommendedTools) ? gap.recommendedTools : [];
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    style={{
                      padding: '0.85rem',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 8,
                      display: 'flex', flexDirection: 'column', gap: '0.4rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                        {gap.missingSkill || 'Technical Skill Gap'}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        color: getImportanceColor(gap.importance || 'Optional'),
                        fontWeight: 700, textTransform: 'uppercase'
                      }}>
                        {gap.importance || 'Optional'}
                      </span>
                    </div>

                    {recommendedTools.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center', marginTop: '0.1rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <BookOpen size={11} /> Learn tools:
                        </span>
                        {recommendedTools.map((tool, tIdx) => (
                          <span key={tIdx} style={{ fontSize: '0.75rem', padding: '0.1rem 0.35rem', background: 'rgba(59,130,246,0.08)', color: '#60a5fa', borderRadius: 4 }}>
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Portfolio & Brand Tips */}
        <motion.div {...fadeUp} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={20} style={{ color: 'var(--color-success)' }} /> Brand Optimization Strategy
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Concrete steps to build your online footprint, attract tech recruiters, and bypass resume filters.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {portfolioTips.map((tip, idx) => {
              if (!tip) return null;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  style={{
                    padding: '0.85rem',
                    background: 'rgba(255,255,255,0.01)',
                    borderLeft: '3px solid var(--color-primary)',
                    borderRadius: '0 8px 8px 0',
                    display: 'flex', flexDirection: 'column', gap: '0.3rem'
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
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                      <Zap size={13} style={{ color: 'var(--color-secondary)', flexShrink: 0, marginTop: 2 }} />
                      <span><strong>Action item:</strong> <span style={{ color: 'var(--color-secondary)' }}>{tip.actionItem}</span></span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </div>

    </motion.div>
  );
}
