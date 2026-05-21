import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Helper to get the Gemini model instance.
 * @param {string} clientApiKey - Dynamically provided client API key (optional)
 * @returns {import('@google/generative-ai').GenerativeModel}
 */
function getGeminiModel(clientApiKey) {
  // Priority: 1. Client key passed in header, 2. Env variable
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please provide it in Settings or set GEMINI_API_KEY in the server environment.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });
}

/**
 * Safely cleans and parses JSON responses from Gemini, stripping any markdown wrapper blocks if returned.
 * @param {string} text
 * @returns {object}
 */
function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9]*\s*/, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned.trim());
}

/**
 * Analyzes resume text against a job description using Gemini, incorporating real-time scraped social profile data and generating a detailed employability audit.
 * @param {string} resumeText 
 * @param {string} jobDescription 
 * @param {object} scannedProfileData - Raw scraped profiles (github, linkedin)
 * @param {string} [clientApiKey] 
 * @returns {Promise<object>} Detailed AI analysis
 */
export async function analyzeResumeWithGemini(resumeText, jobDescription, scannedProfileData, clientApiKey) {
  try {
    const model = getGeminiModel(clientApiKey);

    const githubSummary = scannedProfileData?.github 
      ? `Public Bio: "${scannedProfileData.github.bio || 'None'}"\nPublic Repositories:\n${JSON.stringify(scannedProfileData.github.repos, null, 2)}`
      : 'No public GitHub profile data available or linked.';

    const linkedinUrl = scannedProfileData?.linkedinUrl || 'No LinkedIn profile URL found.';

    const prompt = `
You are an expert ATS (Applicant Tracking System) parser and senior recruiter.
Analyze the following candidate Resume against the Job Description, taking into account their scanned social profile data (public GitHub repository details and LinkedIn profile link).

Job Description:
"""
${jobDescription}
"""

Resume:
"""
${resumeText}
"""

Scanned GitHub Data:
"""
${githubSummary}
"""

Scanned LinkedIn URL:
"""
${linkedinUrl}
"""

Instructions:
1. Evaluate overall fit, keyword scoring, structure, and readability.
2. Formulate a final "suitability" verdict (Suitable, Partially Suitable, or Not Suitable) based on BOTH the Resume and their public GitHub repositories (does their actual code repository reflect the skills claimed on the resume?).
3. Construct a simulated/reconstructed LinkedIn profile representation based on their Resume and LinkedIn URL. Generate a realistic Headline, Industry, Connections count estimation (between 100 and 500+), and Profile Summary. Mark it as verified and match it to their resume details.
4. Perform an **Employability & Portfolio Audit**:
   - Evaluate the university/college mentioned in the resume. Provide a reputation score and constructive branding feedback regarding career exposure. Avoid purely negative or dismissive comments for regional, lesser-known, or lower-tier colleges; instead, outline realistic off-campus networking strategies, open-source projects, and local developer meetups to proactively bridge the exposure gap.
   - Determine if the candidate's skills and experience make them ready for an "Internship", "Junior Full-Time" or "Full-Time" role, with a readiness score and justification.
   - Review the candidate's listed projects. Categorize each project as "Outdated" (uses obsolete tools), "Overused" (very common projects like basic To-do lists, calculators, basic weather apps, simple clones, basic CRUD), or "Good" (modern, complex, unique).
   - For any "Outdated" or "Overused" project, suggest a modern, high-value replacement project that matches the target Job Description's domain/context (for example: recommend systems programming/RTOS/C/C++ projects for firmware or hardware roles; cloud/vector databases/high-throughput microservices/Kubernetes for backend roles; modern state management/CSS animations/responsive designs/performance tuning for frontend roles; vector search/embeddings/RAG/fine-tuning for AI and ML roles). Ensure the suggestions provide a complete technical blueprint that recruiters find attractive.
   - Identify critical skill gaps in high-demand technologies, with learning recommendations.
   - Provide concrete tips to optimize their LinkedIn and portfolio website.

Provide the evaluation in JSON format.
Return ONLY a valid JSON object matching the following structure:
{
  "atsScore": <integer between 0 and 100, representing overall fit>,
  "keywordScore": <integer between 0 and 100, based on keyword overlap>,
  "formattingScore": <integer between 0 and 100, based on professional resume structure>,
  "readabilityScore": <integer between 0 and 100, based on clarity and style>,
  "missingKeywords": [<string array of critical keywords or skills present in JD but missing in Resume>],
  "strengths": [<string array of candidate's top strengths matched to the JD, limit to 3-4 items>],
  "weaknesses": [<string array of gaps or areas where the candidate falls short, limit to 3-4 items>],
  "suggestions": [
    {
      "category": "<one of: keywords, style, structure, contact, length>",
      "severity": "<one of: high, medium, low>",
      "message": "<actionable recommendation with specific details>"
    }
  ],
  "suitability": {
    "verdict": "<one of: Suitable, Partially Suitable, Not Suitable>",
    "summary": "<paragraph explaining candidate's fit, matching their GitHub/resume work to the job>",
    "githubAlignment": "<sentence analyzing how their actual GitHub projects align with the role requirements>",
    "linkedinAlignment": "<sentence analyzing their professional brand and profile presence>"
  },
  "scannedProfiles": {
    "github": {
      "username": "${scannedProfileData?.github?.username || ''}",
      "bio": "${scannedProfileData?.github?.bio || ''}",
      "followers": ${scannedProfileData?.github?.followers || 0},
      "publicReposCount": ${scannedProfileData?.github?.publicReposCount || 0},
      "repos": ${JSON.stringify(scannedProfileData?.github?.repos || [])}
    },
    "linkedin": {
      "profileUrl": "${linkedinUrl}",
      "headline": "<reconstructed professional headline matching their work history, e.g., Senior React Developer at TechCorp>",
      "industry": "<candidate's industry, e.g., Software Development>",
      "connections": "<estimated connections count, e.g., 500+ or 250+>",
      "summary": "<reconstructed professional summary matching their resume summary>",
      "verified": true
    }
  },
  "employabilityAudit": {
    "universityExposure": {
      "reputationScore": <integer between 0 and 100, representing university's placement branding strength>,
      "brandingVerdict": "<short description of college's corporate footprint, career fairs, or tier rating>",
      "careerOpportunities": "<description of candidate's likely exposure or access to off-campus/on-campus hiring>"
    },
    "readiness": {
      "verdict": "<one of: Internship, Junior Full-Time, Full-Time>",
      "rating": <integer between 0 and 100, representing job/placement readiness>,
      "rationale": "<detailed rationale for this readiness verdict, highlighting their actual project depth>"
    },
    "projectDoctor": [
      {
        "originalProject": "<name of project from resume>",
        "status": "<one of: Outdated, Overused, Good>",
        "feedback": "<critical feedback on why this project is outdated/overused/good, e.g., 'To-do lists are trivial and do not prove database or state-management proficiency.'>",
        "suggestedReplacement": {
          "title": "<name of recommended replacement project, e.g. Real-Time Collaborative Workspace>",
          "techStack": "<suggested tools, e.g. Next.js, Socket.io, Redis, Tailwind>",
          "description": "<sentence describing the implementation details of this replacement project>"
        }
      }
    ],
    "skillGaps": [
      {
        "missingSkill": "<e.g., Docker, AWS, Next.js, CI/CD, TypeScript>",
        "importance": "<one of: Critical, Highly Recommended, Optional>",
        "recommendedTools": [<string array of libraries/tools to study, e.g., ["GitHub Actions", "GitLab CI"]>]
      }
    ],
    "portfolioTips": [
      {
        "category": "<one of: LinkedIn Profile, Portfolio Website, Resume Presentation>",
        "tip": "<specific strategy to boost visibility, e.g., Write a custom LinkedIn banner and pin your GitHub repository link.>",
        "actionItem": "<immediate action to execute>"
      }
    ]
  }
}

Make sure to be critical yet constructive, reflecting actual recruiter behaviors. Ensure all JSON fields are populated. Strictly return raw JSON only. Absolutely DO NOT wrap the output in markdown code blocks (such as \`\`\`json ... \`\`\`). The response must be directly parseable.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return cleanJsonResponse(text);
  } catch (error) {
    console.error('Gemini Resume Analysis Error:', error);
    throw error;
  }
}

/**
 * Optimizes a resume bullet point using Gemini.
 * @param {string} bulletPoint 
 * @param {string} jobDescription 
 * @param {string} [clientApiKey] 
 * @returns {Promise<object>} Optimized bullet options
 */
export async function optimizeBulletPointWithGemini(bulletPoint, jobDescription, clientApiKey) {
  try {
    const model = getGeminiModel(clientApiKey);

    const prompt = `
You are a professional resume writer and career coach.
Optimize the following resume bullet point, tailoring it to stand out for a job with this Job Description (if provided).

Job Description:
"""
${jobDescription || 'N/A'}
"""

Original Bullet Point:
"${bulletPoint}"

Optimize this bullet point into 3 distinct styles:
1. "actionOriented": Strong action verbs, active voice, concise and professional.
2. "metricFocused": Highlight measurable impact, percentage, time saved, or revenue, incorporating mock realistic numbers if no numbers were in the original.
3. "starFormat": Contextualized format matching the STAR method (Situation, Task, Action, Result) combined into a single, high-impact bullet point.

Return ONLY a valid JSON object matching the following structure:
{
  "original": "<original bullet point>",
  "actionOriented": "<optimized action-oriented bullet point>",
  "metricFocused": "<optimized metric-focused bullet point>",
  "starFormat": "<optimized STAR method bullet point>"
}

Ensure all JSON fields are populated. Strictly return raw JSON only. Do not wrap the output in markdown code blocks.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return cleanJsonResponse(text);
  } catch (error) {
    console.error('Gemini Bullet Point Optimization Error:', error);
    throw error;
  }
}
