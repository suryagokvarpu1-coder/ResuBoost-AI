import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Search, Filter, CheckCircle, XCircle, Lightbulb, Sparkles, Hash } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
};

export default function KeywordSuggestions({ data }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!data || !data.keywords) {
    return (
      <motion.div {...fadeUp} className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <Search size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Please upload and analyze a resume first to see keyword overlap.</p>
      </motion.div>
    );
  }

  const { present = [], missing = [] } = data.keywords;

  const getFilteredKeywords = () => {
    let list;
    if (filter === 'all') {
      list = [
        ...present.map(k => ({ name: k, found: true })),
        ...missing.map(k => ({ name: k, found: false }))
      ];
    } else if (filter === 'present') {
      list = present.map(k => ({ name: k, found: true }));
    } else {
      list = missing.map(k => ({ name: k, found: false }));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(k => k.name.toLowerCase().includes(q));
    }

    return list;
  };

  const filteredList = getFilteredKeywords();

  const filterButtons = [
    { key: 'all', label: `All Keywords (${present.length + missing.length})`, icon: Hash },
    { key: 'present', label: `Present (${present.length})`, icon: CheckCircle, disabled: present.length === 0 },
    { key: 'missing', label: `Missing (${missing.length})`, icon: XCircle, disabled: missing.length === 0 }
  ];

  const matchPercent = present.length + missing.length > 0
    ? Math.round((present.length / (present.length + missing.length)) * 100)
    : 0;

  return (
    <motion.div {...fadeUp} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Key size={24} style={{ color: 'var(--color-primary)' }} />
          Keyword Match Analyzer
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          ATS systems scan for specific resume keywords matching the job description. Optimize your resume by adding missing skills.
        </p>
      </div>

      {/* Match Score Bar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={14} style={{ color: 'var(--color-primary)' }} /> Keyword Match Rate
          </span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: matchPercent >= 70 ? 'var(--color-success)' : matchPercent >= 40 ? 'var(--color-warning)' : 'var(--color-danger)' }}>
            {matchPercent}%
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 4, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${matchPercent}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: '100%', borderRadius: 4,
              background: matchPercent >= 70 ? 'linear-gradient(90deg, #10b981, #34d399)' : matchPercent >= 40 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #f43f5e, #fb7185)'
            }}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
        background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {filterButtons.map(fb => (
            <motion.button
              key={fb.key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`btn ${filter === fb.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter(fb.key)}
              disabled={fb.disabled}
              style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <fb.icon size={13} />
              {fb.label}
            </motion.button>
          ))}
        </div>

        <div style={{ position: 'relative', maxWidth: 250 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search keywords..."
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 32, padding: '0.4rem 0.75rem 0.4rem 32px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Keyword Grid */}
      <AnimatePresence mode="wait">
        {filteredList.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <Filter size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
            <p>No keywords match the search or filter criteria.</p>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            {filteredList.map((keyword, index) => (
              <motion.div
                key={`${keyword.name}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
                whileHover={{ scale: 1.04, y: -2 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                  background: keyword.found ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                  border: `1px solid ${keyword.found ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                  transition: 'all 0.2s ease', cursor: 'default'
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: keyword.found ? '#34d399' : '#f87171', textTransform: 'capitalize' }}>
                  {keyword.name}
                </span>
                {keyword.found
                  ? <CheckCircle size={15} style={{ color: '#34d399', flexShrink: 0 }} />
                  : <XCircle size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                }
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ATS Explanation Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          marginTop: '1.5rem', padding: '1.25rem',
          background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
        }}
      >
        <Lightbulb size={22} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Why does keyword density matter?
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
            Applicant Tracking Systems use exact keyword matching algorithms. If a job description repeatedly asks for "React", "Docker", or "CI/CD", failing to mention those exact phrases on your resume might filter your application out automatically, even if you have equivalent experience. Incorporate missing keywords organically under your "Skills" or "Professional Experience" sections.
          </p>
        </div>
      </motion.div>

    </motion.div>
  );
}
