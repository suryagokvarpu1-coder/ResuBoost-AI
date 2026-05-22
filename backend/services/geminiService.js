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
export async function analyzeResumeWithGemini(resumeText, jobDescription, scannedProfileData, clientApiKey, reqFile = null) {
  try {
    const model = getGeminiModel(clientApiKey);

    const githubSummary = scannedProfileData?.github 
      ? `Public Bio: "${scannedProfileData.github.bio || 'None'}"\nPublic Repositories:\n${JSON.stringify(scannedProfileData.github.repos, null, 2)}`
      : 'Not provided or not applicable to this profession.';

    const linkedinUrl = scannedProfileData?.linkedinUrl || 'Not provided.';

    const prompt = `
You are an expert ATS (Applicant Tracking System) parser and senior universal career coach.
Analyze the following candidate Resume against the Job Description. Be aware that the candidate may belong to ANY profession (e.g., Software, Medical, Legal, Civil Engineering, Business, Government, Arts).

Job Description:
"""
${jobDescription}
"""

Resume Text Extracted (May be incomplete if image-based):
"""
${resumeText || 'No text extracted. Please rely on the attached PDF document.'}
"""

Instructions:
1. Identify the candidate's primary Professional Domain (e.g., "Healthcare", "Legal", "Software Engineering", "Business Administration").
2. Evaluate overall fit, keyword scoring, structure, and readability specific to their domain. Do NOT penalize non-IT professionals for lacking GitHub or coding portfolios.
3. Formulate a final "suitability" verdict based on the Resume and any provided online footprint.
4. Construct a simulated/reconstructed professional profile representation based on their Resume. Generate a realistic Headline, Industry, and Profile Summary.
5. Perform an **Employability & Portfolio Audit**:
   - Evaluate the university/college mentioned. Provide constructive branding feedback regarding career exposure in their specific field.
   - Determine readiness for "Internship", "Junior Full-Time" or "Full-Time" role.
   - Review the candidate's listed projects, clinical rotations, cases, or practical experiences. Categorize each as "Outdated", "Overused" (e.g., standard generic academic assignments), or "Good".
   - Suggest modern, high-value replacement projects or practical experiences that match the target Job Description's domain (e.g., for Medical: 'Participate in a specific clinical trial'; for Legal: 'Draft mock contracts for SaaS startups'; for IT: 'Build a distributed system').
   - Identify critical skill/certification gaps in high-demand areas for their specific profession.
   - Provide concrete tips to optimize their professional presence.

Provide the evaluation in JSON format.
Return ONLY a valid JSON object matching the following structure:
{
  "detectedDomain": "<Candidate's primary professional domain>",
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
    "summary": "<paragraph explaining candidate's fit for this specific profession>",
    "digitalFootprintAlignment": "<sentence analyzing their online presence or lack thereof, tailored to what is expected in their industry>"
  },
  "scannedProfiles": {
    "professionalProfile": {
      "headline": "<reconstructed professional headline>",
      "industry": "<candidate's industry>",
      "summary": "<reconstructed professional summary>",
      "verified": true
    }
  },
  "employabilityAudit": {
    "universityExposure": {
      "reputationScore": <integer between 0 and 100>,
      "brandingVerdict": "<short description of college's corporate footprint or tier rating>",
      "careerOpportunities": "<description of candidate's likely exposure or access to hiring>"
    },
    "readiness": {
      "verdict": "<one of: Internship, Junior Full-Time, Full-Time>",
      "rating": <integer between 0 and 100, representing job/placement readiness>,
      "rationale": "<detailed rationale for this readiness verdict>"
    },
    "projectDoctor": [
      {
        "originalProject": "<name of project/experience from resume>",
        "status": "<one of: Outdated, Overused, Good>",
        "feedback": "<critical feedback on why this is outdated/overused/good>",
        "suggestedReplacement": {
          "title": "<name of recommended replacement experience/project>",
          "techStack": "<suggested tools, methodologies, or frameworks>",
          "description": "<sentence describing the details of this replacement experience>"
        }
      }
    ],
    "skillGaps": [
      {
        "missingSkill": "<e.g., specific software, legal framework, medical procedure, or soft skill>",
        "importance": "<one of: Critical, Highly Recommended, Optional>",
        "recommendedTools": [<string array of concepts/tools to study>]
      }
    ],
    "portfolioTips": [
      {
        "category": "<one of: LinkedIn Profile, Portfolio Website, Resume Presentation>",
        "tip": "<specific strategy to boost visibility in their industry>",
        "actionItem": "<immediate action to execute>"
      }
    ]
  }
}

  Make sure to be critical yet constructive, reflecting actual recruiter behaviors across various industries. Ensure all JSON fields are populated. Strictly return raw JSON only. Absolutely DO NOT wrap the output in markdown code blocks.`;

    const promptParts = [
      { text: prompt }
    ];

    if (reqFile && reqFile.mimetype === 'application/pdf') {
      promptParts.push({
        inlineData: {
          data: reqFile.buffer.toString('base64'),
          mimeType: 'application/pdf'
        }
      });
    }

    const result = await model.generateContent(promptParts);
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
