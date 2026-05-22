import { useState, useEffect } from 'react';

export default function LearningHub({ user, apiKey }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/learning/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey || ''
          },
          body: JSON.stringify({ userProfile: user?.preferences || { domain: 'software_it' } })
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
    <div className="dashboard-container animate-fade-in" style={{ padding: '2rem' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="glow-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Learning Hub</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Personalized course and certification recommendations for your career.</p>
      </header>

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--color-primary)' }}>Curating your learning path...</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {courses.map((course, idx) => (
              <div key={idx} className="metric-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{course.title}</h3>
                  <span className="badge" style={{ background: 'rgba(217, 70, 239, 0.1)', color: 'var(--color-secondary)' }}>
                    {course.provider}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    ⏱️ {course.duration}
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                    💰 {course.cost}
                  </span>
                  {course.priority === 'Must-do' && (
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '4px' }}>
                      🔥 Top Priority
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1 }}>
                  {course.outcome}
                </p>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
                    {(course.skillsGained || []).map((s, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', color: 'var(--color-primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <a 
                    href={course.link || '#'} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-outline" 
                    style={{ width: '100%', textAlign: 'center', display: 'block', padding: '0.5rem' }}
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
