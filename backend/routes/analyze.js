import express from 'express';
import multer from 'multer';
import { extractTextFromBuffer } from '../utils/parser.js';
import { analyzeResumeLocally } from '../utils/analyzer.js';
import { analyzeResumeWithGemini, optimizeBulletPointWithGemini } from '../services/geminiService.js';
import { mapToCanonicalDomain } from '../utils/domainMapper.js';

const router = express.Router();

// Multer config: hold file in memory, limit to 5MB
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// URL Extractor Helpers
function extractGitHubUsername(text) {
  const match = text.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}

function extractLinkedInUrl(text) {
  const match = text.match(/(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
  return match ? 'https://' + match[1] : null;
}

// GitHub REST API Scraper
async function fetchGitHubProfile(username) {
  if (!username) return null;
  try {
    console.log(`Scraping GitHub details for user: ${username}`);
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'ResuBoost-AI-Resume-Analyzer' }
    });
    
    if (!userRes.ok) {
      if (userRes.status === 403) {
        console.warn(`GitHub API rate limit hit (status 403) for username: ${username}. Skipping live profile scrape.`);
      } else {
        console.warn(`GitHub API user fetch returned status ${userRes.status} for username: ${username}`);
      }
      return null;
    }
    const user = await userRes.json();
    
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`, {
      headers: { 'User-Agent': 'ResuBoost-AI-Resume-Analyzer' }
    });
    
    let repos = [];
    if (reposRes.ok) {
      const reposData = await reposRes.json();
      repos = reposData.map(r => ({
        name: r.name,
        description: r.description || 'No description provided.',
        language: r.language || 'HTML/CSS/JS',
        stars: r.stargazers_count,
        url: r.html_url
      }));
    } else {
      if (reposRes.status === 403) {
        console.warn(`GitHub API repos fetch rate limited (status 403) for username: ${username}.`);
      } else {
        console.warn(`GitHub API repos fetch returned status ${reposRes.status} for username: ${username}`);
      }
    }

    return {
      username,
      name: user.name || username,
      bio: user.bio || 'No public bio listed.',
      followers: user.followers || 0,
      publicReposCount: user.public_repos || 0,
      repos
    };
  } catch (err) {
    console.error(`Failed to scrape GitHub data for ${username}:`, err.message);
    return null;
  }
}

/**
 * Helper to generate offline fallback suggestions for bullet points
 */
function localOptimizeBullet(bulletPoint, jobDescription) {
  const weakVerbsMap = {
    'worked on': 'Architected and developed',
    'helped with': 'Collaborated on the execution of',
    'did': 'Executed',
    'was responsible for': 'Spearheaded and took ownership of',
    'made': 'Engineered',
    'wrote': 'Authored and standardized',
    'built': 'Designed and implemented',
    'created': 'Pioneered and deployed',
    'managed': 'Orchestrated and led'
  };

  let action = bulletPoint.trim();
  let verbSwapped = false;
  for (const [weak, strong] of Object.entries(weakVerbsMap)) {
    const regex = new RegExp(`\\b${weak}\\b`, 'i');
    if (regex.test(action)) {
      action = action.replace(regex, strong);
      verbSwapped = true;
      break;
    }
  }

  if (!verbSwapped) {
    action = 'Spearheaded the optimization of ' + action.charAt(0).toLowerCase() + action.slice(1);
  }

  const mockMetrics = [
    'boosting system scalability and reducing API latency by 28%',
    'improving team workflow efficiency by 15% and saving 6+ hours weekly',
    'resulting in a 32% increase in active user engagement and feature adoption',
    'accelerating page performance by 40% using cutting-edge optimization protocols'
  ];
  const metric = mockMetrics[Math.floor(Math.random() * mockMetrics.length)];

  const actionOriented = `${action} to maximize operational performance.`;
  const metricFocused = `${action}, ${metric}.`;
  
  const starFormat = `Situation: Faced with legacy infrastructure limitations.\nTask: Re-engineer and upgrade critical features.\nAction: ${action}.\nResult: Successfully deployed changes, ${metric}.`;

  return {
    original: bulletPoint,
    actionOriented,
    metricFocused,
    starFormat,
    isFallback: true
  };
}

/**
 * Local fallback simulation of universal employability audit
 */
function generateLocalEmployabilityAudit(resumeText) {
  const wordCount = resumeText.split(/\s+/).length;
  const hasExperience = /experience|work history|clinical|internship|clerkship|residency/i.test(resumeText);
  const readinessVerdict = (wordCount < 180 || !hasExperience) ? 'Entry-Level / Internship' : 'Junior / Mid-Level';
  
  return {
    universityExposure: {
      reputationScore: 50,
      brandingVerdict: 'Standard educational footprint detected.',
      careerOpportunities: 'Use AI API key to generate specific institutional branding insights.'
    },
    readiness: {
      verdict: readinessVerdict,
      rating: hasExperience ? 75 : 55,
      rationale: 'Offline estimation based on word count and standard experience markers.'
    },
    projectDoctor: [
      {
        originalProject: 'Local Profile Scan',
        status: 'Good',
        feedback: 'Unable to deeply analyze practical experience offline.',
        suggestedReplacement: {
          title: 'Enable AI Analysis',
          techStack: 'Gemini API',
          description: 'Provide an API key for deep, domain-specific project and clinical/practical experience auditing.'
        }
      }
    ],
    skillGaps: [
      {
        missingSkill: 'AI Domain Analysis',
        importance: 'Critical',
        recommendedTools: ['Add Gemini API Key in Settings']
      }
    ],
    portfolioTips: [
      {
        category: 'Professional Profile',
        tip: 'Ensure your resume uses industry-standard formatting tailored to your specific domain.',
        actionItem: 'Review top profiles in your field for standard formatting practices.'
      }
    ]
  };
}

// POST /api/analyze
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || '';
    const jobDescription = req.body.jobDescription || '';

    // If file is uploaded, extract text from it
    if (req.file) {
      const { buffer, mimetype } = req.file;
      resumeText = await extractTextFromBuffer(buffer, mimetype);
    }

    if (!resumeText.trim() && !req.file) {
      return res.status(400).json({ error: 'Please upload a resume file or paste your resume text.' });
    }

    const clientApiKey = req.headers['x-api-key'] || '';
    const hasApiKey = !!(clientApiKey || process.env.GEMINI_API_KEY);

    // 1. Run local parsing and analysis (always runs)
    const localResult = analyzeResumeLocally(resumeText, jobDescription);

    // 2. Scan URLs & Scrape GitHub public data in real-time
    const githubUsername = extractGitHubUsername(resumeText);
    const linkedinUrl = extractLinkedInUrl(resumeText);
    const githubData = await fetchGitHubProfile(githubUsername);

    const scannedProfileData = {
      github: githubData,
      linkedinUrl: linkedinUrl
    };

    // 3. If AI key is present, enhance with Gemini
    if (hasApiKey) {
      try {
        const aiResult = await analyzeResumeWithGemini(
          resumeText, 
          jobDescription, 
          scannedProfileData, 
          clientApiKey,
          req.file
        );
        
        const mergedResult = {
          atsScore: aiResult.atsScore ?? localResult.atsScore,
          breakdown: {
            keywordScore: aiResult.keywordScore ?? localResult.breakdown.keywordScore,
            formattingScore: aiResult.formattingScore ?? localResult.breakdown.formattingScore,
            readabilityScore: aiResult.readabilityScore ?? localResult.breakdown.readabilityScore
          },
          keywords: {
            present: localResult.keywords.present,
            missing: Array.from(new Set([
              ...(aiResult.missingKeywords || []),
              ...localResult.keywords.missing
            ])),
            all: Array.from(new Set([
              ...(aiResult.missingKeywords || []),
              ...localResult.keywords.all
            ]))
          },
          structure: {
            ...localResult.structure,
            gitHubFound: !!githubUsername,
            linkedInFound: !!linkedinUrl
          },
          metrics: localResult.metrics,
          suggestions: [
            ...localResult.suggestions.filter(s => s.category === 'contact'),
            ...(aiResult.suggestions || []).map(s => ({
              category: s.category || 'keywords',
              severity: s.severity || 'medium',
              message: s.message
            }))
          ],
          strengths: aiResult.strengths || [],
          weaknesses: aiResult.weaknesses || [],
          suitability: aiResult.suitability || {
            verdict: 'Partially Suitable',
            summary: 'Profile parsed, but AI suitability verdict could not be generated.',
            digitalFootprintAlignment: 'No digital footprint verification performed.'
          },
          scannedProfiles: aiResult.scannedProfiles || {
            professionalProfile: { headline: 'Professional', industry: 'Unknown', summary: 'Parsed from local.', verified: false }
          },
          employabilityAudit: aiResult.employabilityAudit || generateLocalEmployabilityAudit(resumeText),
          detectedDomain: mapToCanonicalDomain(aiResult.detectedDomain),
          extractedProfile: aiResult.extractedProfile ? {
            ...aiResult.extractedProfile,
            domain: mapToCanonicalDomain(aiResult.extractedProfile.domain)
          } : null,
          isAI: true
        };

        return res.json(mergedResult);
      } catch (aiError) {
        console.warn('AI analysis failed, falling back to local analysis:', aiError.message);
      }
    }

    // 4. Fallback: local result with local profiles representation and simulated audit
    const localSuitability = {
      verdict: localResult.atsScore >= 75 ? 'Suitable' : localResult.atsScore >= 50 ? 'Partially Suitable' : 'Not Suitable',
      summary: `Offline Evaluation: The candidate matches ${localResult.breakdown.keywordScore}% of job description keywords. Detected keywords: ${localResult.keywords.present.slice(0, 4).join(', ') || 'none'}.`,
      digitalFootprintAlignment: 'Requires AI key for comprehensive digital presence analysis.'
    };

    const localScannedProfiles = {
      professionalProfile: {
        headline: 'Professional Profile (Local Scanned)',
        industry: 'Various',
        summary: 'Reconstructed professional details parsed from resume.',
        verified: false
      }
    };

    const localEmployabilityAudit = generateLocalEmployabilityAudit(resumeText);
    const offlineDetectedDomain = mapToCanonicalDomain(resumeText);

    return res.json({
      ...localResult,
      structure: {
        ...localResult.structure,
        gitHubFound: !!githubUsername,
        linkedInFound: !!linkedinUrl
      },
      suitability: localSuitability,
      scannedProfiles: localScannedProfiles,
      employabilityAudit: localEmployabilityAudit,
      detectedDomain: offlineDetectedDomain,
      extractedProfile: {
        profession: 'Professional',
        domain: offlineDetectedDomain,
        skills: localResult.keywords.present || [],
        education: 'Not parsed (Offline)',
        experience: 'Not parsed (Offline)',
        certifications: [],
        projects: [],
        careerInterests: []
      },
      isAI: false,
      warning: 'Using offline analyzer. Enter a Gemini API Key in Settings to get full AI suitability checks and profile scans.'
    });

  } catch (error) {
    console.error('Analysis Endpoint Error:', error);
    const isClientError = error.message.includes('Failed to parse') || error.message.includes('Unsupported file type');
    res.status(isClientError ? 400 : 500).json({ 
      error: isClientError ? error.message : 'Failed to analyze resume due to a server error.', 
      details: error.message 
    });
  }
});

// POST /api/optimize-bullet
router.post('/optimize-bullet', async (req, res) => {
  try {
    const { bulletPoint, jobDescription } = req.body;
    if (!bulletPoint || !bulletPoint.trim()) {
      return res.status(400).json({ error: 'Bullet point text is required.' });
    }

    const clientApiKey = req.headers['x-api-key'] || '';
    const hasApiKey = !!(clientApiKey || process.env.GEMINI_API_KEY);

    if (hasApiKey) {
      try {
        const optimized = await optimizeBulletPointWithGemini(bulletPoint, jobDescription, clientApiKey);
        return res.json({ ...optimized, isAI: true });
      } catch (aiError) {
        console.warn('AI bullet optimization failed, falling back to local optimizer:', aiError.message);
        const fallback = localOptimizeBullet(bulletPoint, jobDescription);
        return res.json({ ...fallback, warning: 'AI service unavailable. Generated using custom templates.' });
      }
    }

    const fallback = localOptimizeBullet(bulletPoint, jobDescription);
    return res.json(fallback);

  } catch (error) {
    console.error('Bullet Optimizer Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to optimize bullet point.', details: error.message });
  }
});

export default router;
