import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Loader, Clock, DollarSign, Flame, ExternalLink,
  Sparkles, Award, GraduationCap, Zap
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
};

export default function LearningHub({ user, apiKey, analysisResult }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const activeProfile = analysisResult?.extractedProfile || user?.preferences || { domain: 'general_professional', profession: 'Professional' };

        const res = await fetch('/api/learning/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey || ''
          },
          body: JSON.stringify({ userProfile: activeProfile })
        });
        const result = await res.json();
        setCourses(result.recommendations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user, apiKey]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem 0' }}>
      <motion.header {...fadeUp} style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <GraduationCap size={32} style={{ color: 'var(--color-primary)' }} />
          Learning <span className="glow-text-gradient">Hub</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto' }}>Personalized course and certification recommendations for your career.</p>
      </motion.header>

      {loading ? (
        <motion.div {...fadeUp} className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
            <Loader size={48} style={{ color: 'var(--color-primary)' }} />
          </motion.div>
          <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Curating your learning path...</p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {courses.map((course, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{course.title}</h3>
                <span className="badge" style={{ background: 'rgba(217, 70, 239, 0.1)', color: 'var(--color-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Award size={12} /> {course.provider}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={11} /> {course.duration}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <DollarSign size={11} /> {course.cost}
                </span>
                {course.priority === 'Must-do' && (
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Flame size={11} /> Top Priority
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                {course.outcome}
              </p>

              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                  {(course.skillsGained || []).map((s, i) => (
                    <span key={i} style={{ fontSize: '0.7rem', color: 'var(--color-primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Zap size={9} /> {s}
                    </span>
                  ))}
                </div>
                <motion.a
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={course.link || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ width: '100%', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.5rem' }}
                >
                  <ExternalLink size={14} /> View Details
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
