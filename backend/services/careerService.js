import { GoogleGenerativeAI } from '@google/generative-ai';
import { DOMAINS, USER_CATEGORIES } from '../data/careersData.js';

function getGeminiModel(clientApiKey) {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API Key missing.');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });
}

function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9]*\s*/, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned.trim());
}

/**
 * Generate AI-powered career exploration based on user profile.
 */
export async function exploreCareerWithAI(userProfile, clientApiKey) {
  try {
    const model = getGeminiModel(clientApiKey);
    const domainInfo = DOMAINS[userProfile.domain] || {};

    const prompt = `
You are an expert career counselor with deep knowledge of the Indian job market and global career trends.
The user has provided their profile. Give comprehensive, personalized career guidance.

User Profile:
- Category: ${userProfile.category || 'Not specified'}
- Education: ${userProfile.education || 'Not specified'}
- Domain/Field: ${userProfile.domain || 'Not specified'} 
- Experience: ${userProfile.experience || 'Fresher'}
- Current Skills: ${(userProfile.skills || []).join(', ') || 'Not listed'}
- Career Goal: ${userProfile.goal || 'Open to all opportunities'}
- Location Preference: ${userProfile.location || 'Open to all'}
- Work Type Preference: ${userProfile.workType || 'Any'}

Domain Context:
${JSON.stringify(domainInfo.subDomains || [], null, 2)}

Generate a comprehensive career intelligence report. Return ONLY a valid JSON object:
{
  "headline": "<1-line personalized career headline for this user>",
  "summary": "<2-3 sentence personalized career guidance summary>",
  "recommendedPaths": [
    {
      "title": "<career path title>",
      "match": <0-100 match score>,
      "reason": "<why this suits them>",
      "timeToReady": "<estimated time e.g., 6 months, 1 year>",
      "averageSalary": "<expected salary range in INR or USD>",
      "keySkillsNeeded": ["<skill1>", "<skill2>", "<skill3>"],
      "firstStep": "<immediate first action to take>"
    }
  ],
  "skillGaps": [
    {
      "skill": "<missing or weak skill>",
      "priority": "<Critical|High|Medium>",
      "whyNeeded": "<reason this skill matters for their goal>",
      "howToLearn": "<specific course or action to learn this>",
      "timeToLearn": "<estimated learning time>"
    }
  ],
  "immediateActions": [
    "<specific action 1 to take this week>",
    "<specific action 2>",
    "<specific action 3>"
  ],
  "industryInsight": "<2 sentence current state of their industry in India and globally>",
  "salaryExpectation": {
    "current": "<what they can earn now>",
    "in1Year": "<expected after 1 year of targeted upskilling>",
    "in3Years": "<expected at mid-career stage>",
    "in5Years": "<expected at senior level>"
  },
  "workModeRecommendation": "<best work mode for their profile: Full-time/Freelance/Hybrid/Remote>",
  "topCompanies": ["<company1>", "<company2>", "<company3>", "<company4>", "<company5>"],
  "competitionLevel": "<Low|Moderate|High|Very High>",
  "outlook": "<Excellent|Good|Stable|Declining>",
  "certificationPriority": ["<most important cert>", "<second>", "<third>"]
}
Return ONLY raw JSON. No markdown formatting.
`;
    const result = await model.generateContent(prompt);
    return cleanJsonResponse(result.response.text());
  } catch (err) {
    console.error('Career Explore AI Error:', err.message);
    throw err;
  }
}

/**
 * Generate a personalized career roadmap.
 */
export async function generateCareerRoadmap(userProfile, targetRole, clientApiKey) {
  try {
    const model = getGeminiModel(clientApiKey);

    const prompt = `
You are an expert career roadmap architect and life coach for professionals in India and globally.

User Current State:
- Education: ${userProfile.education || 'Not specified'}
- Domain: ${userProfile.domain || 'General'}
- Current Skills: ${(userProfile.skills || []).join(', ') || 'None listed'}
- Experience: ${userProfile.experience || '0 years'}
- Target Role: ${targetRole || userProfile.goal || 'Senior professional in their field'}

Generate a detailed, realistic, and actionable career roadmap. Return ONLY valid JSON:
{
  "targetRole": "<final target role title>",
  "totalDuration": "<estimated total time e.g., 18 months>",
  "overview": "<2-sentence roadmap summary>",
  "phases": [
    {
      "phase": 1,
      "title": "<phase title e.g., 'Foundation Building'>",
      "duration": "<e.g., 3 months>",
      "goal": "<specific outcome of this phase>",
      "tasks": [
        {
          "task": "<specific task>",
          "type": "<Learn|Build|Apply|Network|Certify>",
          "resource": "<specific course/book/platform>",
          "timeEstimate": "<e.g., 2 weeks>"
        }
      ],
      "milestone": "<measurable deliverable at end of phase>",
      "checkpointQuestion": "<question to self-assess readiness to move forward>"
    }
  ],
  "keyMilestones": [
    { "month": <number>, "achievement": "<specific measurable achievement>" }
  ],
  "salaryProgression": [
    { "stage": "<stage name>", "expectedSalary": "<salary range>", "timeframe": "<when>" }
  ],
  "criticalSuccessFactors": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "commonPitfalls": ["<pitfall to avoid>", "<pitfall 2>", "<pitfall 3>"],
  "networkingStrategy": "<specific networking advice for this domain>",
  "portfolioRequirements": "<what portfolio/projects to build>",
  "alternativePaths": [
    { "path": "<alternative role>", "reason": "<why it's a good alternative>" }
  ]
}
Return ONLY raw JSON. No markdown.
`;
    const result = await model.generateContent(prompt);
    return cleanJsonResponse(result.response.text());
  } catch (err) {
    console.error('Roadmap Generation AI Error:', err.message);
    throw err;
  }
}

/**
 * Generate domain-specific AI intelligence guide.
 */
export async function getDomainIntelligence(domainId, subDomainId, userLevel, clientApiKey) {
  try {
    const model = getGeminiModel(clientApiKey);
    const domain = DOMAINS[domainId];
    if (!domain) throw new Error(`Domain ${domainId} not found.`);

    const prompt = `
You are a domain expert and career intelligence analyst for the ${domain.label} sector in India and globally.

Domain: ${domain.label}
Sub-domain: ${subDomainId || 'General'}
User Level: ${userLevel || 'Beginner'}

Provide comprehensive domain intelligence. Return ONLY valid JSON:
{
  "domainOverview": "<3-sentence expert overview of this domain in 2025–2026>",
  "marketDemand": "<High|Very High|Moderate|Low>",
  "growthRate": "<e.g., 23% YoY in India>",
  "topSkillsInDemand": [
    { "skill": "<skill name>", "demandLevel": "<Critical|High|Medium>", "trend": "<Rising|Stable|Declining>" }
  ],
  "emergingTechnologies": ["<tech1>", "<tech2>", "<tech3>", "<tech4>"],
  "topRecruiters": [
    { "company": "<company name>", "type": "<MNC|Startup|PSU|Consultancy>", "roles": ["<role1>", "<role2>"] }
  ],
  "indianJobMarket": {
    "hotspots": ["<city1>", "<city2>", "<city3>"],
    "remoteOpportunities": "<High|Medium|Low>",
    "salaryRange": "<entry to expert>",
    "growthOutlook": "<2025-2030 outlook>"
  },
  "globalOpportunities": {
    "topCountries": ["<country1>", "<country2>", "<country3>"],
    "visaPathways": "<e.g., H1B for USA, Tier-2 for UK>",
    "averageGlobalSalary": "<in USD>"
  },
  "certifications": [
    { "name": "<cert name>", "provider": "<provider>", "importance": "<Must-have|Recommended|Optional>", "cost": "<cost>", "duration": "<prep time>" }
  ],
  "dayInLife": "<paragraph describing a typical workday in this domain>",
  "challenges": ["<challenge 1>", "<challenge 2>", "<challenge 3>"],
  "opportunities": ["<opportunity 1>", "<opportunity 2>", "<opportunity 3>"],
  "futureProofScore": <0-100>,
  "aiImpact": "<how AI is changing this domain>",
  "indianExams": [
    { "exam": "<exam name>", "conducting body": "<body>", "eligibility": "<eligibility>", "frequency": "<once/twice a year>" }
  ]
}
Return ONLY raw JSON. No markdown.
`;
    const result = await model.generateContent(prompt);
    return cleanJsonResponse(result.response.text());
  } catch (err) {
    console.error('Domain Intelligence AI Error:', err.message);
    throw err;
  }
}

/**
 * Match opportunity listings to user profile using AI.
 */
export async function matchOpportunitiesToProfile(userProfile, opportunityType, clientApiKey) {
  try {
    const model = getGeminiModel(clientApiKey);

    const prompt = `
You are a recruitment and opportunity matching specialist.

User Profile:
- Education: ${userProfile.education || 'Not specified'}
- Domain: ${userProfile.domain || 'General'}
- Skills: ${(userProfile.skills || []).join(', ') || 'Not listed'}
- Experience: ${userProfile.experience || '0 years'}
- Location: ${userProfile.location || 'India'}
- Opportunity Type Preference: ${opportunityType || 'All'}

Generate 8 highly relevant, realistic opportunities. Return ONLY valid JSON:
{
  "opportunities": [
    {
      "id": "<unique id>",
      "title": "<job/opportunity title>",
      "company": "<company or organization name>",
      "type": "<Job|Internship|Freelance|Government|Startup|Research|Apprenticeship>",
      "location": "<city or Remote>",
      "salary": "<salary or stipend range>",
      "experience": "<required experience>",
      "skills": ["<required skill 1>", "<required skill 2>", "<required skill 3>"],
      "matchScore": <0-100>,
      "matchReason": "<why this is a good match for this user>",
      "applyVia": "<platform to apply: LinkedIn/Naukri/Internshala/official website>",
      "deadline": "<when to apply by or 'Ongoing'>",
      "description": "<2-sentence job description>",
      "benefits": "<key benefits e.g., remote, learning, equity>",
      "growthPotential": "<High|Medium|Low>",
      "isGovernment": <boolean>
    }
  ],
  "totalMatches": <number>,
  "searchTip": "<specific platform or strategy to find more opportunities like these>",
  "profileGap": "<one thing the user should improve to get even better opportunities>"
}
Return ONLY raw JSON. No markdown.
`;
    const result = await model.generateContent(prompt);
    return cleanJsonResponse(result.response.text());
  } catch (err) {
    console.error('Opportunity Matching AI Error:', err.message);
    throw err;
  }
}

/**
 * Generate AI-powered learning recommendations.
 */
export async function generateLearningRecommendations(userProfile, clientApiKey) {
  try {
    const model = getGeminiModel(clientApiKey);

    const prompt = `
You are an expert learning and development advisor.

User Profile:
- Domain: ${userProfile.domain || 'General'}
- Current Skills: ${(userProfile.skills || []).join(', ') || 'Basic'}
- Goal: ${userProfile.goal || 'Career growth'}
- Budget: ${userProfile.budget || 'Mixed (free and paid)'}
- Time Available per week: ${userProfile.timeAvailable || '5-10 hours'}
- Preferred Learning Style: ${userProfile.learningStyle || 'Video + Practice'}
- Education: ${userProfile.education || 'Graduate'}

Generate 6 highly personalized learning recommendations. Return ONLY valid JSON:
{
  "learningPath": "<title of the recommended learning path>",
  "estimatedCompletion": "<e.g., 4 months at 8hrs/week>",
  "recommendations": [
    {
      "order": <1-6>,
      "title": "<course or learning resource title>",
      "provider": "<provider name>",
      "type": "<Course|Book|Project|Community|Certification>",
      "duration": "<duration>",
      "cost": "<Free|Paid: amount>",
      "priority": "<Must-do|Highly Recommended|Optional>",
      "reason": "<specific reason this resource suits this user>",
      "outcome": "<what they will be able to do after completing this>",
      "link": "<provider website URL>",
      "governmentScheme": "<if applicable, mention PMKVY/SWAYAM/NPTEL>",
      "skillsGained": ["<skill1>", "<skill2>"]
    }
  ],
  "weeklySchedule": "<suggested weekly study schedule>",
  "practiceProjects": [
    { "project": "<project name>", "purpose": "<what this demonstrates>", "timeEstimate": "<weeks>" }
  ],
  "communityResources": ["<Discord/Reddit/Slack/LinkedIn Group for this domain>"],
  "mentorshipAdvice": "<how to find mentors in this field>",
  "governmentResources": "<relevant Indian govt. skill programs for this domain>"
}
Return ONLY raw JSON. No markdown.
`;
    const result = await model.generateContent(prompt);
    return cleanJsonResponse(result.response.text());
  } catch (err) {
    console.error('Learning Recommendations AI Error:', err.message);
    throw err;
  }
}
