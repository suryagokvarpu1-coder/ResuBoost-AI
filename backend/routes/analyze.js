import express from 'express';
import multer from 'multer';
import { extractTextFromBuffer } from '../utils/parser.js';
import { analyzeResumeLocally } from '../utils/analyzer.js';
import { analyzeResumeWithGemini, optimizeBulletPointWithGemini } from '../services/geminiService.js';

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
 * Local simulation of student employability audit
 */
function generateLocalEmployabilityAudit(resumeText) {
  // Try to detect university
  const universityMatch = resumeText.match(/(?:university|college|institute|school|polytechnic|academy)/i);
  const uniName = universityMatch ? "Scanned University Reference" : "Local College Reference";
  
  // Detect generic projects
  const projectsDetected = [];
  const lowerText = resumeText.toLowerCase();
  
  // 1. Todo List
  if (lowerText.includes('todo') || lowerText.includes('to-do') || lowerText.includes('task tracker')) {
    projectsDetected.push({
      originalProject: 'Todo List Application',
      status: 'Overused',
      feedback: 'Trivial task trackers are extremely overused by junior developers. They do not demonstrate advanced asynchronous data fetching, state management, or production configurations.',
      suggestedReplacement: {
        title: 'Real-Time Collaborative Project Workspace',
        techStack: 'Next.js, Socket.io, Redis, TailwindCSS, MongoDB',
        description: 'Design a board containing collaborative Kanban boards, live editing text docs, and instant team messaging using WebSockets.'
      }
    });
  }
  
  // 2. Calculator
  if (lowerText.includes('calculator')) {
    projectsDetected.push({
      originalProject: 'Calculator Project',
      status: 'Outdated',
      feedback: 'Basic calculation tools represent academic basics and do not attract recruiters looking for industrial engineering solutions.',
      suggestedReplacement: {
        title: 'SaaS Billing & Subscription Analytics Dashboard',
        techStack: 'React, Node.js, Stripe API, Chart.js, PostgreSQL',
        description: 'Construct a dashboard displaying subscription conversions, MRR metrics, automated invoice generator, and secure Stripe checkout integrations.'
      }
    });
  }

  // 3. Weather
  if (lowerText.includes('weather')) {
    projectsDetected.push({
      originalProject: 'Weather Forecast App',
      status: 'Overused',
      feedback: 'Simple API wrapper fetchers are standard student assignments. They fail to showcase robust caching, backend design, or secure proxy architectures.',
      suggestedReplacement: {
        title: 'Geo-Spatial Extreme Climate Alerting Engine',
        techStack: 'Vite, Leaflet Maps, Express.js, OpenWeather API, Redis, Twilio SMS',
        description: 'Create an engine that caches regional sensor data, maps interactive grids, and triggers automated SMS alerts if temperature thresholds exceed safety limits.'
      }
    });
  }

  // 4. Portfolio / Personal Website
  if (lowerText.includes('portfolio') || lowerText.includes('personal website') || lowerText.includes('personal site') || lowerText.includes('landing page')) {
    projectsDetected.push({
      originalProject: 'Portfolio Website / Static Site',
      status: 'Outdated',
      feedback: 'Static portfolio pages only demonstrate basic HTML/CSS. Recruiters want to see dynamic, production-grade applications that solve real-world problems.',
      suggestedReplacement: {
        title: 'Developer Portfolio Engine with Dynamic CMS & Analytics',
        techStack: 'Next.js 14, Sanity.io CMS, PostgreSQL, TailwindCSS, Vercel Analytics',
        description: 'Create a customizable portfolio generator where developers can manage content through a headless CMS and track live visitor geography, device types, and page-by-page dropoffs via an integrated analytics dashboard.'
      }
    });
  }

  // 5. Clone Apps
  if (lowerText.includes('clone') || lowerText.includes('netflix') || lowerText.includes('spotify') || lowerText.includes('amazon') || lowerText.includes('twitter') || lowerText.includes('instagram')) {
    let matchedClone = 'Clone Application';
    if (lowerText.includes('netflix')) matchedClone = 'Netflix Clone';
    else if (lowerText.includes('spotify')) matchedClone = 'Spotify Clone';
    else if (lowerText.includes('amazon')) matchedClone = 'Amazon Clone';
    else if (lowerText.includes('twitter')) matchedClone = 'Twitter Clone';
    
    projectsDetected.push({
      originalProject: matchedClone,
      status: 'Overused',
      feedback: 'UI-only clones mimic existing systems but lack backend database integrity, user session management, search indexing, and real-time content delivery systems.',
      suggestedReplacement: {
        title: 'Multi-Tenant SaaS Streaming / E-Commerce Engine',
        techStack: 'React, Node.js, Express, Redis Caching, AWS S3 / CloudFront, PostgreSQL',
        description: 'Build a production-grade content distribution system supporting JWT auth, adaptive bitrate video/audio streaming or Stripe-integrated multi-vendor checkouts, and global CDN delivery.'
      }
    });
  }

  // 6. CRUD / Blog
  if (lowerText.includes('crud') || lowerText.includes('blog') || lowerText.includes('forum') || lowerText.includes('journal')) {
    projectsDetected.push({
      originalProject: 'Basic CRUD / Blog Application',
      status: 'Overused',
      feedback: 'Basic Create-Read-Update-Delete apps are introductory tutorials. They do not demonstrate advanced backend optimization, search capability, or concurrency control.',
      suggestedReplacement: {
        title: 'Markdown-Driven Publisher with Full-Text Search & Analytics',
        techStack: 'Next.js, Elasticsearch, PostgreSQL, Redis, Docker, GitHub Actions',
        description: 'Build a publishing platform with instant full-text fuzzy search, markdown parsing, custom editor, view counting under high concurrency with Redis, and containerized Docker deployment.'
      }
    });
  }

  // 7. Management / Registry Systems
  if (lowerText.includes('management') || lowerText.includes('registry') || lowerText.includes('record system') || lowerText.includes('library system') || lowerText.includes('student system')) {
    projectsDetected.push({
      originalProject: 'Management / Registry System',
      status: 'Outdated',
      feedback: 'Local management systems (e.g., student/library managers) focus on basic database rows without addressing concurrency, cloud security, user roles, or automated reporting.',
      suggestedReplacement: {
        title: 'Enterprise Multi-Tenant ERP with Role-Based Access Control',
        techStack: 'TypeScript, NestJS, Prisma ORM, PostgreSQL, Auth0, AWS RDS',
        description: 'Design a secure cloud-native ERP dashboard with row-level database security, role-based access control (RBAC), PDF report export, and automated daily email digest cron jobs.'
      }
    });
  }

  // 8. Basic Games
  if (lowerText.includes('game') || lowerText.includes('tictactoe') || lowerText.includes('tic-tac-toe') || lowerText.includes('rock paper') || lowerText.includes('snake') || lowerText.includes('sudoku') || lowerText.includes('tetris')) {
    projectsDetected.push({
      originalProject: 'Basic Arcade / Board Game',
      status: 'Outdated',
      feedback: 'Simple local board games show basic JS arrays but lack server state synchronization, latency correction, or multiplayer lobby matching algorithms.',
      suggestedReplacement: {
        title: 'Multiplayer Real-Time Matchmaking Lobby & Game Engine',
        techStack: 'React, Node.js, WebSockets (ws/Socket.io), Redis Adapter, PostgreSQL',
        description: 'Develop a real-time lobby matchmaking system with game queue orchestration, state validation on the server to prevent cheating, and database persistence for global user leaderboards.'
      }
    });
  }

  // 9. Chatbot
  if (lowerText.includes('chatbot') || lowerText.includes('chat-bot') || lowerText.includes('qa bot') || lowerText.includes('faq')) {
    projectsDetected.push({
      originalProject: 'Basic Rule-Based Chatbot',
      status: 'Overused',
      feedback: 'If-else rule chatbots are obsolete. Modern organizations need smart agents capable of reasoning, vector-context retrieval, and conversational history memory.',
      suggestedReplacement: {
        title: 'AI-Powered Enterprise Q&A Engine (RAG System)',
        techStack: 'Python FastAPI, LangChain, OpenAI / Gemini Embeddings, Pinecone Vector DB, Streamlit',
        description: 'Develop a Retrieval-Augmented Generation system allowing enterprise users to upload documentation, indexing it into a vector store, and running context-aware semantic QA searches.'
      }
    });
  }

  // Fallback if no specific overused project was text-matched
  if (projectsDetected.length === 0) {
    projectsDetected.push({
      originalProject: 'Generic Personal Project',
      status: 'Overused',
      feedback: 'Portfolio projects lack production complexity (caching, testing, build setups). Recruiters want to see live deployment architectures.',
      suggestedReplacement: {
        title: 'AI-Powered PDF Semantic Search Engine',
        techStack: 'Next.js, Python FastAPI, Gemini API (Embeddings), Pinecone Vector DB, AWS S3',
        description: 'Build an engine allowing users to upload large books and perform semantic search queries via vector search similarity.'
      }
    });
  }

  // Skills gap simulation
  const skillGaps = [];
  if (!lowerText.includes('docker') && !lowerText.includes('container')) {
    skillGaps.push({
      missingSkill: 'Docker & Containerization',
      importance: 'Highly Recommended',
      recommendedTools: ['Docker Desktop', 'Docker Compose', 'Dockerfiles']
    });
  }
  if (!lowerText.includes('ci/cd') && !lowerText.includes('github actions') && !lowerText.includes('pipeline')) {
    skillGaps.push({
      missingSkill: 'CI/CD Automation',
      importance: 'Critical',
      recommendedTools: ['GitHub Actions', 'YAML configs', 'Docker Hub deployment']
    });
  }
  if (!lowerText.includes('aws') && !lowerText.includes('cloud') && !lowerText.includes('gcp') && !lowerText.includes('azure')) {
    skillGaps.push({
      missingSkill: 'Cloud Deployment (AWS/GCP)',
      importance: 'Highly Recommended',
      recommendedTools: ['AWS S3', 'AWS EC2', 'Vercel/Render hosting']
    });
  }
  if (!lowerText.includes('typescript')) {
    skillGaps.push({
      missingSkill: 'TypeScript Type Safety',
      importance: 'Critical',
      recommendedTools: ['TS syntax', 'Interfaces', 'Strict checks']
    });
  }

  // Calculate readiness
  const wordCount = resumeText.split(/\s+/).length;
  const hasExperience = lowerText.includes('experience') || lowerText.includes('work history') || lowerText.includes('intern');
  const readinessVerdict = (wordCount < 180 || !hasExperience) ? 'Internship' : 'Junior Full-Time';
  const readinessRating = (wordCount < 180) ? 55 : (hasExperience ? 75 : 62);

  return {
    universityExposure: {
      reputationScore: universityMatch ? 70 : 50,
      brandingVerdict: universityMatch ? 'Standard university footprint detected. Average career exposure.' : 'Unrecognized educational branding. Focus on off-campus channels.',
      careerOpportunities: 'Offers standard placement drives. Industry exposure requires active personal networking and open-source contributions.'
    },
    readiness: {
      verdict: readinessVerdict,
      rating: readinessRating,
      rationale: readinessVerdict === 'Internship' 
        ? 'Resume displays limited practical work experience or thin project scope, making an Internship the ideal stepping stone.'
        : 'Displays core programming competence and foundational engineering projects suitable for Junior Full-Time hiring.'
    },
    projectDoctor: projectsDetected,
    skillGaps: skillGaps.slice(0, 3), // Limit to 3
    portfolioTips: [
      {
        category: 'LinkedIn Profile',
        tip: 'Optimize your LinkedIn Headline to focus on specific roles rather than generic student titles. Use: "Aspiring Frontend Developer | React | JavaScript" instead of "Student at XYZ University".',
        actionItem: 'Update LinkedIn Headline and summary matching your top tech stack skills.'
      },
      {
        category: 'Portfolio Website',
        tip: 'Deploy your projects to free hosting services (like Vercel, Netlify, Render) and provide live clickable URLs on your resume.',
        actionItem: 'Deploy your top 2 projects and insert live links.'
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

    if (!resumeText.trim()) {
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
          clientApiKey
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
            githubAlignment: 'No repository verification performed.',
            linkedinAlignment: 'No profile verification performed.'
          },
          scannedProfiles: aiResult.scannedProfiles || {
            github: githubData,
            linkedin: linkedinUrl ? { profileUrl: linkedinUrl, verified: true, simulated: true } : null
          },
          employabilityAudit: aiResult.employabilityAudit || generateLocalEmployabilityAudit(resumeText),
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
      githubAlignment: githubData 
        ? `Found public GitHub profile (${githubData.username}) containing ${githubData.publicReposCount} repositories.` 
        : 'No GitHub repository link detected in resume.',
      linkedinAlignment: linkedinUrl 
        ? `LinkedIn URL format verified (${linkedinUrl}).` 
        : 'No LinkedIn link detected in resume.'
    };

    const localScannedProfiles = {
      github: githubData,
      linkedin: linkedinUrl ? {
        profileUrl: linkedinUrl,
        headline: 'Professional Profile (Local Scanned)',
        industry: 'Information Technology',
        connections: '500+',
        summary: 'Reconstructed professional details parsed from resume.',
        verified: true,
        simulated: true
      } : null
    };

    const localEmployabilityAudit = generateLocalEmployabilityAudit(resumeText);

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
      isAI: false,
      warning: 'Using offline analyzer. Enter a Gemini API Key in Settings to get full AI suitability checks and profile scans.'
    });

  } catch (error) {
    console.error('Analysis Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to analyze resume.', details: error.message });
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
