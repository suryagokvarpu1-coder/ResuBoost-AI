import express from 'express';
import {
  exploreCareerWithAI,
  generateCareerRoadmap,
  generateDomainIntelligence,
  generateLearningRecommendations
} from '../services/careerService.js';
import { DOMAINS, USER_CATEGORIES, GOVERNMENT_SCHEMES } from '../data/careersData.js';

const router = express.Router();

// Helper to map Gemini API errors to user-friendly messages
function mapGeminiError(err, defaultMessage) {
  let errorMessage = (err.message || '').toLowerCase();
  let friendlyMessage = defaultMessage;
  let statusCode = 500;

  if (errorMessage.includes('invalid_api_key') || errorMessage.includes('api key not valid') || errorMessage.includes('400')) {
    friendlyMessage = 'Invalid API Key. Please verify your Gemini API key in Settings.';
    statusCode = 401;
  } else if (errorMessage.includes('quota_exceeded') || errorMessage.includes('429')) {
    friendlyMessage = 'Your Gemini API key quota has been exceeded. Please check your usage or try again later.';
    statusCode = 429;
  } else if (errorMessage.includes('api_key_missing')) {
    friendlyMessage = 'Gemini API key is missing. Please configure it in Settings.';
    statusCode = 400;
  } else if (errorMessage.includes('model_unavailable') || errorMessage.includes('503') || errorMessage.includes('unavailable')) {
    friendlyMessage = 'The Gemini API service is temporarily unavailable. Please try again.';
    statusCode = 503;
  }

  return { friendlyMessage, statusCode };
}

// GET /api/career/meta — Return all categories, domains, schemes (no AI needed)
router.get('/meta', (req, res) => {
  try {
    const domainsArray = Object.values(DOMAINS).map(d => ({
      id: d.id,
      label: d.label,
      icon: d.icon,
      color: d.color,
      description: d.description,
      subDomains: d.subDomains,
      topExams: d.topExams,
      trendingSkills: d.trendingSkills,
      careerPaths: d.careerPaths,
      topCompanies: d.topCompanies
    }));
    res.json({ categories: USER_CATEGORIES, domains: domainsArray, governmentSchemes: GOVERNMENT_SCHEMES });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load career meta data.', details: err.message });
  }
});

// POST /api/career/explore — AI career exploration
router.post('/explore', async (req, res) => {
  try {
    const { userProfile } = req.body;
    if (!userProfile) return res.status(400).json({ error: 'User profile is required.' });

    const clientApiKey = req.headers['x-api-key'] || '';
    const hasApiKey = !!(clientApiKey || process.env.GEMINI_API_KEY);

    if (!hasApiKey) {
      // Fallback: return static domain info
      const domain = DOMAINS[userProfile.domain];
      if (!domain) return res.status(400).json({ error: 'Invalid domain selected.' });
      return res.json({
        isAI: false,
        headline: `Career Guidance for ${domain.label}`,
        summary: domain.description,
        recommendedPaths: (domain.careerPaths || []).map((p, i) => ({
          title: p.title,
          match: 90 - (i * 10),
          reason: `Based on your ${userProfile.experience || 'early'} stage career`,
          timeToReady: p.years,
          averageSalary: p.salary,
          keySkillsNeeded: domain.subDomains?.[0]?.skills?.slice(0, 3) || [],
          firstStep: `Explore ${domain.topExams?.[0] || 'relevant certifications'}`
        })),
        topCompanies: domain.topCompanies || [],
        industryInsight: `${domain.label} is an active and growing field. Key trending skills include ${(domain.trendingSkills || []).slice(0, 3).join(', ')}.`,
        certificationPriority: domain.topExams || [],
        warning: 'AI key not configured — showing curated static guidance. Add a Gemini API key for personalized AI analysis.'
      });
    }

    const result = await exploreCareerWithAI(userProfile, clientApiKey);
    res.json({ ...result, isAI: true });
  } catch (err) {
    console.error('Career Explore Error:', err);
    const { friendlyMessage, statusCode } = mapGeminiError(err, 'Career exploration failed.');
    res.status(statusCode).json({ error: friendlyMessage, details: err.message });
  }
});

// POST /api/career/roadmap — AI roadmap generation
router.post('/roadmap', async (req, res) => {
  try {
    const { userProfile, targetRole } = req.body;
    if (!userProfile) return res.status(400).json({ error: 'User profile is required.' });

    const trimmedTarget = targetRole ? targetRole.trim() : '';

    const clientApiKey = req.headers['x-api-key'] || '';
    const hasApiKey = !!(clientApiKey || process.env.GEMINI_API_KEY);

    if (!hasApiKey) {
      const domain = DOMAINS[userProfile.domain] || {};
      return res.json({
        isAI: false,
        targetRole: targetRole || 'Senior Professional',
        totalDuration: '12–18 months',
        overview: `This roadmap will guide you from your current ${userProfile.experience || 'early'} stage to a ${targetRole || 'senior professional'} role in ${domain.label || 'your field'}.`,
        phases: [
          { phase: 1, title: 'Skill Foundation', duration: '3 months', goal: 'Master core technical skills', tasks: [{ task: `Study core ${domain.label || ''} fundamentals`, type: 'Learn', resource: 'NPTEL / Coursera', timeEstimate: '4 weeks' }, { task: 'Complete 1 beginner project', type: 'Build', resource: 'Personal GitHub', timeEstimate: '2 weeks' }], milestone: 'First portfolio project deployed', checkpointQuestion: 'Can you explain your project to a recruiter?' },
          { phase: 2, title: 'Skill Specialization', duration: '4 months', goal: 'Develop domain expertise', tasks: [{ task: 'Earn a recognized certification', type: 'Certify', resource: (domain.topExams || ['Industry Cert'])[0], timeEstimate: '8 weeks' }, { task: 'Build 2 advanced projects', type: 'Build', resource: 'GitHub Portfolio', timeEstimate: '6 weeks' }], milestone: 'Certification earned + 3 portfolio projects', checkpointQuestion: 'Are you applying to jobs/internships yet?' },
          { phase: 3, title: 'Real-World Experience', duration: '5 months', goal: 'Get hands-on experience', tasks: [{ task: 'Apply to internships or entry-level roles', type: 'Apply', resource: 'LinkedIn/Naukri/Internshala', timeEstimate: '1 month' }, { task: 'Contribute to open source or freelance', type: 'Apply', resource: 'GitHub/Upwork', timeEstimate: '3 months' }], milestone: 'First professional experience on resume', checkpointQuestion: 'Have you received feedback from interviews?' }
        ],
        criticalSuccessFactors: ['Consistency over speed', 'Building in public', 'Networking early'],
        commonPitfalls: ['Tutorial hell (watching but not building)', 'Skipping fundamentals', 'Not applying early enough'],
        warning: 'Add a Gemini API key for a fully personalized AI-generated roadmap.'
      });
    }

    const result = await generateCareerRoadmap(userProfile, trimmedTarget, clientApiKey);
    
    // Check if AI semantic validation rejected the request
    if (result.isValidRequest === false) {
      return res.status(400).json({ error: result.validationMessage || 'Please enter a valid career goal, skill, domain, or learning path.' });
    }

    res.json({ ...result, isAI: true });
  } catch (err) {
    console.error('Roadmap Generation Error:', err);
    const { friendlyMessage, statusCode } = mapGeminiError(err, 'Roadmap generation failed.');
    res.status(statusCode).json({ error: friendlyMessage, details: err.message });
  }
});

// POST /api/career/domain-guide — AI domain intelligence
router.post('/domain-guide', async (req, res) => {
  try {
    const { domainId, subDomainId, userLevel } = req.body;
    if (!domainId) return res.status(400).json({ error: 'Domain ID is required.' });

    const domain = DOMAINS[domainId];
    if (!domain) return res.status(404).json({ error: 'Domain not found.' });

    const clientApiKey = req.headers['x-api-key'] || '';
    const hasApiKey = !!(clientApiKey || process.env.GEMINI_API_KEY);

    if (!hasApiKey) {
      return res.json({
        isAI: false,
        domainOverview: domain.description,
        marketDemand: 'High',
        topSkillsInDemand: (domain.subDomains || []).flatMap(s => (s.skills || []).slice(0, 2)).slice(0, 8).map(s => ({ skill: s, demandLevel: 'High', trend: 'Rising' })),
        emergingTechnologies: domain.trendingSkills || [],
        topRecruiters: (domain.topCompanies || []).slice(0, 5).map(c => ({ company: c, type: 'Industry Leader', roles: ['Entry-Level', 'Mid-Level'] })),
        indianExams: (domain.topExams || []).map(e => ({ exam: e, conductingBody: 'Relevant Authority', eligibility: 'As per official notification', frequency: 'Annual' })),
        certifications: [],
        warning: 'Add a Gemini API key for full AI-powered domain intelligence.'
      });
    }

    const result = await generateDomainIntelligence(domainId, subDomainId, userLevel, clientApiKey);
    res.json({ ...result, isAI: true });
  } catch (err) {
    console.error('Domain Guide Error:', err);
    const { friendlyMessage, statusCode } = mapGeminiError(err, 'Domain guide generation failed.');
    res.status(statusCode).json({ error: friendlyMessage, details: err.message });
  }
});

export default router;
