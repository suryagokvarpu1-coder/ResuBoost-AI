import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Loader, MapPin, DollarSign, Clock, Building2,
  Sparkles, Target, AlertTriangle, Lightbulb, ExternalLink, Zap
} from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
};

export default function OpportunityHub({ user, apiKey, analysisResult }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTip, setSearchTip] = useState('');
  const [profileGap, setProfileGap] = useState('');

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const activeProfile = analysisResult?.extractedProfile || user?.preferences || { domain: 'general_professional', profession: 'Professional' };

        const res = await fetch('/api/opportunities/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey || ''
          },
          body: JSON.stringify({ userProfile: activeProfile, opportunityType: 'all' })
        });
        const result = await res.json();
        setOpportunities(result.opportunities || []);
        if (result.searchTip) setSearchTip(result.searchTip);
        if (result.profileGap) setProfileGap(result.profileGap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, [user, apiKey, analysisResult]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <motion.header {...fadeUp} style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Briefcase size={32} style={{ color: 'var(--color-primary)' }} />
          Opportunity <span className="glow-text-gradient">Hub</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 700, margin: '0 auto' }}>
          Jobs, internships, freelance gigs, and government schemes accurately matched to your profession and domain.
        </p>
      </motion.header>

      {loading ? (
        <motion.div {...fadeUp} className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
            <Loader size={48} style={{ color: 'var(--color-primary)' }} />
          </motion.div>
          <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>Finding Perfect Matches...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Cross-referencing your skills and domain against market opportunities.</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Tips Row */}
          {(searchTip || profileGap) && (
            <div className="grid-2">
              {searchTip && (
                <motion.div {...fadeUp} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-accent)' }}>
                  <h4 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Lightbulb size={18} /> Search Tip
                  </h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{searchTip}</p>
                </motion.div>
              )}
              {profileGap && (
                <motion.div {...fadeUp} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-warning)' }}>
                  <h4 style={{ color: 'var(--color-warning)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Target size={18} /> Profile Optimization
                  </h4>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{profileGap}</p>
                </motion.div>
              )}
            </div>
          )}

          {/* Opportunity Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {opportunities.map((opp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="glass-card"
                style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `4px solid ${opp.isGovernment ? '#eab308' : 'var(--color-primary)'}` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>{opp.title}</h3>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--color-secondary)', fontSize: '1rem', fontWeight: 600 }}>{opp.company}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.95rem', padding: '0.5rem 1rem' }}>
                      {opp.matchScore}% Match
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {opp.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={14} /> {opp.salary}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {opp.experience}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: opp.isGovernment ? '#eab308' : 'var(--color-primary)', fontWeight: 600 }}>
                    <Building2 size={14} /> {opp.type}
                  </span>
                </div>

                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {opp.description}
                </p>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
                  <strong style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Sparkles size={14} /> Why It Matches You:
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{opp.matchReason}</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(opp.skills || []).map((s, i) => (
                      <span key={i} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ExternalLink size={14} /> Apply via {opp.applyVia}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
