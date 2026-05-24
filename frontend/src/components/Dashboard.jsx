import { motion } from 'framer-motion';
import {
  BarChart3, Target, Sparkles, AlertTriangle, CheckCircle, XCircle,
  Award, Briefcase, GraduationCap, Wrench, Code2, TrendingUp,
  Star, ShieldAlert, RefreshCw, Layers, Brain, Lightbulb, Zap,
  FolderOpen, Trophy, BookOpen
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } }
};

const ScoreRing = ({ score, size = 150, strokeWidth = 10, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Dynamic circular glow behind ScoreRing */}
      <div style={{
        position: 'absolute',
        width: size - 20,
        height: size - 20,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}12 0%, ${color}00 70%)`,
        filter: 'blur(15px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', zIndex: 1 }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          strokeDasharray={circumference}
          style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', zIndex: 2 }}>
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ fontSize: '2.4rem', fontWeight: 800, color, lineHeight: 1 }}
        >
          {score}%
        </motion.span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>ATS Score</span>
      </div>
    </div>
  );
};

const BreakdownBar = ({ label, score, color, icon: Icon, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={15} style={{ color }} />
        {label}
      </span>
      <span style={{ color }}>{score}%</span>
    </div>
    <div style={{ height: 8, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.9, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="progress-bar-shimmer"
        style={{ height: '100%', background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: 4 }}
      />
    </div>
  </motion.div>
);

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
  const achievements = extractedProfile.achievements || [];
  const tools = extractedProfile.tools || [];
  const careerInterests = extractedProfile.careerInterests || [];
  const recommendedDomains = extractedProfile.recommendedDomains || [];
  const suitableJobRoles = extractedProfile.suitableJobRoles || [];

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
    if (s >= 80) return '#ffffff';
    if (s >= 50) return '#a3a3a3';
    return '#525252';
  };
  const scoreColor = getScoreColor(atsScore);

  const getVerdictDetails = (verdict) => {
    const v = (verdict || '').toLowerCase();
    if (v.includes('highly suitable') || v === 'suitable') {
      return { label: 'Suitable Match', color: '#ffffff', bg: 'rgba(255, 255, 255, 0.04)', border: 'rgba(255, 255, 255, 0.1)', Icon: CheckCircle };
    } else if (v.includes('partially') || v.includes('partial')) {
      return { label: 'Partial Match', color: '#d4d4d8', bg: 'rgba(255, 255, 255, 0.02)', border: 'rgba(255, 255, 255, 0.06)', Icon: AlertTriangle };
    }
    return { label: 'Low Match', color: '#737373', bg: 'rgba(255, 255, 255, 0.01)', border: 'rgba(255, 255, 255, 0.04)', Icon: XCircle };
  };
  const verdictDetails = suitability ? getVerdictDetails(suitability.verdict) : null;

  const severityIcon = (s) => {
    if (s === 'high') return <ShieldAlert size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />;
    if (s === 'medium') return <AlertTriangle size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />;
    return <Lightbulb size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />;
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* 1. Profile Identity Banner */}
      <motion.div {...fadeUp} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(192, 132, 252, 0.02) 100%)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={28} style={{ color: 'var(--color-primary)' }} />
              {profession}
            </h1>
            <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '1.1rem', marginTop: '0.25rem', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={16} /> Sector: {detectedDomain}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-info" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Award size={14} /> Level: {readiness.verdict || experience}
            </span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Experience: {experience}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Warning */}
      {warning && warning.includes('AI analysis failed') ? (
        <motion.div {...fadeUp} className="badge badge-danger" style={{ padding: '1rem', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={18} /> {warning}
        </motion.div>
      ) : warning && (
        <motion.div {...fadeUp} className="badge badge-warning" style={{ padding: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={18} /> {warning}
        </motion.div>
      )}

      {/* 2. Suitability Verdict */}
      {suitability && verdictDetails && (
        <motion.div {...fadeUp} className="glass-card" style={{ background: verdictDetails.bg, border: `1px solid ${verdictDetails.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <verdictDetails.Icon size={28} style={{ color: verdictDetails.color }} />
            <h2 style={{ color: verdictDetails.color, margin: 0 }}>{verdictDetails.label}</h2>
          </div>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>{suitability.summary}</p>
        </motion.div>
      )}

      {/* 3. ATS Score & Breakdown */}
      <div className="grid-2">
        <motion.div {...fadeUp} className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem' }}>
            <Target size={18} /> ATS Fit Score
          </h3>
          <ScoreRing score={atsScore} color={scoreColor} />
          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Based on <strong style={{ color: 'var(--text-primary)' }}>{detectedDomain}</strong> industry standards
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}>
          <h3 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem' }}>
            <BarChart3 size={18} /> Score Breakdown
          </h3>
          <BreakdownBar label="Keyword Alignment" score={keywordScore} color="var(--color-primary)" icon={Sparkles} delay={0.1} />
          <BreakdownBar label="Structure & Format" score={formattingScore} color="var(--color-secondary)" icon={Layers} delay={0.2} />
          <BreakdownBar label="Readability & Flow" score={readabilityScore} color="var(--color-accent)" icon={BookOpen} delay={0.3} />
        </motion.div>
      </div>

      {/* 4. Detailed Resume Breakdown */}
      <motion.h3 {...fadeUp} style={{ fontSize: '1.5rem', marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Zap size={22} style={{ color: 'var(--color-primary)' }} /> Detailed Resume Breakdown
      </motion.h3>
      <div className="grid-2">
        {/* Skills & Tech */}
        <motion.div {...fadeUp} className="glass-card">
          <h4 style={{ color: 'var(--color-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wrench size={18} /> Core Skills & Tools
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {skills.length > 0 ? skills.map((s, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                className="badge badge-skill">{s}</motion.span>
            )) : null}
            {tools.length > 0 ? tools.map((t, i) => (
              <motion.span key={`t-${i}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: (skills.length + i) * 0.03 }}
                className="badge badge-tool">{t}</motion.span>
            )) : null}
            {skills.length === 0 && tools.length === 0 && <span style={{ color: 'var(--text-muted)' }}>None detected</span>}
          </div>
        </motion.div>

        {/* Education & Certs */}
        <motion.div {...fadeUp} className="glass-card">
          <h4 style={{ color: 'var(--color-secondary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <GraduationCap size={18} /> Profile Highlights
          </h4>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{education}</p>
          {certifications.length > 0 && (
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: achievements.length > 0 ? '0.5rem' : '0' }}>
              {certifications.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
          {achievements.length > 0 && (
            <ul style={{ paddingLeft: '1.2rem', color: 'var(--color-accent)', fontSize: '0.9rem' }}>
              {achievements.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          )}
        </motion.div>

        {/* Career Path */}
        <motion.div {...fadeUp} className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <h4 style={{ color: 'var(--color-success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={18} /> Career Path Opportunities
          </h4>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {suitableJobRoles.length > 0 && (
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Suitable Roles</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {suitableJobRoles.map((role, i) => <span key={i} className="badge badge-success">{role}</span>)}
                </div>
              </div>
            )}
            {recommendedDomains.length > 0 && (
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Recommended Domains</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {recommendedDomains.map((dom, i) => <span key={i} className="badge badge-info">{dom}</span>)}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Strengths */}
        <motion.div {...fadeUp} className="glass-card" style={{ borderLeft: '3px solid rgba(16, 185, 129, 0.4)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, transparent 100%)' }}>
          <h4 style={{ color: 'var(--color-success)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Star size={18} /> Core Strengths
          </h4>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {strengths.length > 0 ? strengths.map((s, i) => <li key={i}>{s}</li>) : <li style={{ color: 'var(--text-muted)' }}>No specific strengths identified.</li>}
          </ul>
        </motion.div>

        {/* Weaknesses */}
        <motion.div {...fadeUp} className="glass-card" style={{ borderLeft: '3px solid rgba(244, 63, 94, 0.4)', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.02) 0%, transparent 100%)' }}>
          <h4 style={{ color: 'var(--color-danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} /> Missing Industry Skills
          </h4>
          <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {skillGaps.length > 0
              ? skillGaps.map((g, i) => <li key={i}><strong>{g.missingSkill}</strong>: {g.importance}</li>)
              : weaknesses.map((w, i) => <li key={i}>{w}</li>)
            }
            {skillGaps.length === 0 && weaknesses.length === 0 && <li style={{ color: 'var(--color-success)' }}>No major gaps detected.</li>}
          </ul>
        </motion.div>
      </div>

      {/* 5. Project & Experience Analysis */}
      {projectDoctor.length > 0 && (
        <motion.div {...fadeUp} className="glass-card">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderOpen size={22} /> Experience & Project Analysis
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projectDoctor.map((pd, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 'var(--radius-sm)', borderLeft: pd.status === 'Good' ? '3px solid rgba(16, 185, 129, 0.4)' : '3px solid rgba(245, 158, 11, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Code2 size={16} style={{ color: 'var(--color-primary)' }} /> {pd.originalProject}
                  </strong>
                  <span className={`badge ${pd.status === 'Good' ? 'badge-success' : 'badge-warning'}`}>{pd.status}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{pd.feedback}</p>
                {pd.suggestedReplacement && pd.status !== 'Good' && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.25rem' }}>
                      <TrendingUp size={14} /> Recommendation: {pd.suggestedReplacement.title}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{pd.suggestedReplacement.description}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 6. Improvement Suggestions */}
      <motion.div {...fadeUp} className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Lightbulb size={22} style={{ color: 'var(--color-warning)' }} /> Improvement Suggestions ({suggestions.length})
          </h3>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn btn-secondary" onClick={onReset}
            style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Analyze Another
          </motion.button>
        </div>
        {suggestions.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Trophy size={20} style={{ color: 'var(--color-success)' }} /> Perfect Resume! No issues found.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {suggestions.map((suggestion, index) => {
              const badgeType = suggestion.severity === 'high' ? 'badge-danger' : suggestion.severity === 'medium' ? 'badge-warning' : 'badge-info';
              return (
                <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                  style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                  {severityIcon(suggestion.severity)}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, margin: 0 }}>{suggestion.message}</p>
                    <small style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Category: {suggestion.category || 'general'}
                    </small>
                  </div>
                  <span className={`badge ${badgeType}`} style={{ textTransform: 'capitalize', flexShrink: 0, height: 'fit-content' }}>{suggestion.severity || 'medium'}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

    </motion.div>
  );
}
