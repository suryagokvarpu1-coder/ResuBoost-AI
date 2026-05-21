import { useState } from 'react';

export default function KeywordSuggestions({ data }) {
  const [filter, setFilter] = useState('all'); // 'all', 'present', 'missing'
  const [searchQuery, setSearchQuery] = useState('');

  if (!data || !data.keywords) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Please upload and analyze a resume first to see keyword overlap.</p>
      </div>
    );
  }

  const { present = [], missing = [] } = data.keywords;

  // Filter lists based on type and search query
  const getFilteredKeywords = () => {
    let list;
    if (filter === 'all') {
      // Merge with labels
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

  return (
    <div className="glass-card animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
          🔑 Keyword Match Analyzer
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          ATS systems scan for specific resume keywords matching the job description. Optimize your resume by adding missing skills.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '0.75rem',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)'
      }}>
        {/* Toggle Toggles */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
          >
            All Keywords ({present.length + missing.length})
          </button>
          <button 
            className={`btn ${filter === 'present' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('present')}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            disabled={present.length === 0}
          >
            Present ({present.length})
          </button>
          <button 
            className={`btn ${filter === 'missing' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('missing')}
            style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
            disabled={missing.length === 0}
          >
            Missing ({missing.length})
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search skills/keywords..."
          className="form-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ maxWidth: '250px', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
        />
      </div>

      {/* Keyword Badges Display Grid */}
      {filteredList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          No keywords match the search or filter criteria.
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
          gap: '1rem',
          marginTop: '0.5rem'
        }}>
          {filteredList.map((keyword, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: keyword.found ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                border: `1px solid ${keyword.found ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
                transition: 'all var(--transition-fast)'
              }}
            >
              <span style={{ 
                fontWeight: 600, 
                fontSize: '0.9rem',
                color: keyword.found ? '#34d399' : '#f87171',
                textTransform: 'capitalize'
              }}>
                {keyword.name}
              </span>
              <span style={{ fontSize: '0.75rem' }}>
                {keyword.found ? '🟢' : '🔴'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ATS Explanation Banner */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1.25rem', 
        background: 'rgba(59, 130, 246, 0.03)', 
        border: '1px solid rgba(59, 130, 246, 0.1)', 
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start'
      }}>
        <span style={{ fontSize: '1.25rem' }}>💡</span>
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Why does keyword density matter?
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>
            Applicant Tracking Systems use exact keyword matching algorithms. If a job description repeatedly asks for "React", "Docker", or "CI/CD", failing to mention those exact phrases on your resume might filter your application out automatically, even if you have equivalent experience. Incorporate missing keywords organically under your "Skills" or "Professional Experience" sections.
          </p>
        </div>
      </div>

    </div>
  );
}
