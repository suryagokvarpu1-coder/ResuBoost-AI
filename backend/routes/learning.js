import express from 'express';
import { COURSES, CERT_PROVIDERS } from '../data/coursesData.js';
import { generateLearningRecommendations } from '../services/careerService.js';

const router = express.Router();

// GET /api/learning/courses — Get filtered course list
router.get('/courses', (req, res) => {
  try {
    const { domain, subDomain, level, price } = req.query;
    let filtered = [...COURSES];

    if (domain && domain !== 'all') {
      filtered = filtered.filter(c => c.domain === domain || c.domain === 'all');
    }
    if (subDomain) {
      filtered = filtered.filter(c => c.subDomain === subDomain);
    }
    if (level) {
      filtered = filtered.filter(c => c.level.toLowerCase() === level.toLowerCase());
    }
    if (price === 'free') {
      filtered = filtered.filter(c => c.price.toLowerCase().includes('free'));
    }

    res.json({ courses: filtered, total: filtered.length, providers: CERT_PROVIDERS });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses.', details: err.message });
  }
});

// POST /api/learning/recommend — AI-powered learning recommendations
router.post('/recommend', async (req, res) => {
  try {
    const { userProfile } = req.body;
    if (!userProfile) return res.status(400).json({ error: 'User profile required.' });

    const clientApiKey = req.headers['x-api-key'] || '';
    const hasApiKey = !!(clientApiKey || process.env.GEMINI_API_KEY);

    // Always include static courses matching the domain
    const domainCourses = COURSES.filter(
      c => c.domain === userProfile.domain || c.domain === 'all'
    ).slice(0, 6);

    if (!hasApiKey) {
      return res.json({
        isAI: false,
        learningPath: `Curated ${userProfile.domain || 'General'} Learning Path`,
        estimatedCompletion: '3–6 months',
        recommendations: domainCourses.map((c, i) => ({
          order: i + 1,
          title: c.title,
          provider: c.provider,
          type: 'Course',
          duration: c.duration,
          cost: c.price,
          priority: i < 2 ? 'Must-do' : 'Highly Recommended',
          reason: 'Highly relevant to your domain',
          outcome: `Proficiency in ${c.skills.slice(0, 2).join(' and ')}`,
          link: c.link,
          skillsGained: c.skills
        })),
        governmentResources: 'Visit SWAYAM (swayam.gov.in) and NPTEL (nptel.ac.in) for free government-certified courses.',
        warning: 'Add Gemini API key for fully personalized AI-curated recommendations.'
      });
    }

    const aiResult = await generateLearningRecommendations(userProfile, clientApiKey);
    // Merge with our static curated courses
    res.json({ ...aiResult, staticCourses: domainCourses, isAI: true });
  } catch (err) {
    console.error('Learning Recommend Error:', err);
    res.status(500).json({ error: 'Learning recommendation failed.', details: err.message });
  }
});

export default router;
