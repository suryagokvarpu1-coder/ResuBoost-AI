// Dictionary of common professional skills, technologies, frameworks, and tools.
const COMMON_KEYWORDS = [
  // Programming & IT
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang', 'php', 'swift', 'kotlin', 'rust', 'sql', 'html', 'css', 'react', 'angular', 'vue', 'node.js', 'django', 'spring boot', 'aws', 'docker', 'kubernetes', 'ci/cd', 'machine learning', 'artificial intelligence',
  // Medical & Healthcare
  'patient care', 'clinical', 'surgery', 'diagnosis', 'medical record', 'emr', 'ehr', 'nursing', 'cpr', 'bls', 'acls', 'anatomy', 'pharmacology', 'radiology', 'pediatrics', 'oncology', 'neurology', 'healthcare management', 'public health', 'epidemiology',
  // Legal & Law
  'litigation', 'contract drafting', 'legal research', 'corporate law', 'intellectual property', 'family law', 'criminal defense', 'legal writing', 'mediation', 'arbitration', 'compliance', 'due diligence', 'patents', 'civil rights',
  // Civil Engineering & Architecture
  'autocad', 'revit', 'sketchup', 'structural engineering', 'project management', 'construction management', 'urban planning', 'surveying', 'geotechnical', 'fluid mechanics', 'blueprints', 'sustainability', 'leed',
  // Finance & Banking
  'financial modeling', 'valuation', 'accounting', 'auditing', 'tax preparation', 'investment banking', 'portfolio management', 'risk management', 'equities', 'derivatives', 'blockchain', 'cryptocurrency', 'fintech',
  // Business, Management & Marketing
  'agile', 'scrum', 'leadership', 'sales', 'seo', 'digital marketing', 'content strategy', 'supply chain', 'logistics', 'crm', 'b2b', 'b2c', 'product management', 'business development',
  // Defense & Government
  'public administration', 'policy analysis', 'security clearance', 'intelligence analysis', 'diplomacy', 'law enforcement', 'tactical training', 'emergency response', 'national security'
];

/**
 * Normalizes text for better keyword matching (lowercases, removes special characters, trims).
 * @param {string} text 
 * @returns {string} normalized text
 */
function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .replace(/[^\w\s\-#\+\.\/]/g, ' ') // Keep alphanumeric, whitespace, dashes, hashes (C#), pluses (C++), dots, and slashes
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Dynamically constructs a boundary-aware regular expression for a technical keyword,
 * resolving edge cases for technical punctuation (like C++, C#, .net, next.js, ci/cd).
 * @param {string} keyword 
 * @returns {RegExp}
 */
function buildKeywordRegex(keyword) {
  // Special exact checks for languages that end with non-alphanumeric punctuation
  if (keyword === 'c++') {
    return /(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9\+])/i;
  }
  if (keyword === 'c#') {
    return /(?<![a-zA-Z0-9])c#(?![a-zA-Z0-9#])/i;
  }
  
  // If the keyword contains spaces, dots, slashes, or dashes, split it and generate 
  // a regex that allows variable separators (space, dot, dash, slash, or nothing)
  if (/[\s\.\-\/]/.test(keyword)) {
    const parts = keyword.split(/[\s\.\-\/]+/);
    const escapedParts = parts.map(p => p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const pattern = escapedParts.join('[\\s\\.\\-\\/]*');
    return new RegExp(`(?<![a-zA-Z0-9])${pattern}(?![a-zA-Z0-9])`, 'i');
  }
  
  // Standard alphanumeric keyword with clean non-alphanumeric boundaries
  const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i');
}

/**
 * Extracts professional keywords found in the input text.
 * @param {string} text - The text to scan
 * @returns {string[]} List of matched keywords
 */
export function extractKeywords(text) {
  const normalized = ` ${normalizeText(text)} `; // Pad with spaces for word boundary simulation
  const foundKeywords = new Set();

  for (const keyword of COMMON_KEYWORDS) {
    const regex = buildKeywordRegex(keyword);
    if (regex.test(normalized)) {
      foundKeywords.add(keyword);
    }
  }

  return Array.from(foundKeywords);
}

/**
 * Runs a complete local analysis on the resume vs job description.
 * @param {string} resumeText 
 * @param {string} jobDescription 
 * @returns {object} Analysis results
 */
export function analyzeResumeLocally(resumeText, jobDescription) {
  const normalizedResume = resumeText.toLowerCase();
  
  // 1. Keyword Overlap
  const jdKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  
  const presentKeywords = [];
  const missingKeywords = [];

  // If the job description is empty or contains no detectable keywords, use a default fallback
  if (jdKeywords.length === 0) {
    // Scrape whatever skills we can see in the resume
    presentKeywords.push(...resumeKeywords.slice(0, 10));
  } else {
    for (const keyword of jdKeywords) {
      if (resumeKeywords.includes(keyword)) {
        presentKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    }
  }

  const keywordMatchPercent = jdKeywords.length > 0 
    ? Math.round((presentKeywords.length / jdKeywords.length) * 100) 
    : 50; // default medium score if no JD keywords found

  // 2. Structural & Contact Formatting Checks
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  const hasPhone = /(\+?\d{1,4}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(resumeText);
  const hasLinkedIn = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/.test(normalizedResume);
  const hasGitHub = /github\.com\/[a-zA-Z0-9_-]+/.test(normalizedResume);

  // Section Checks
  const sections = {
    education: /education|degree|university|college|school|academic/i.test(normalizedResume),
    experience: /experience|work history|employment|professional|career|history/i.test(normalizedResume),
    skills: /skills|technologies|proficiencies|expertise|technical/i.test(normalizedResume),
    projects: /projects|portfolio|personal projects|accomplishments/i.test(normalizedResume),
    summary: /summary|objective|profile|about me|professional summary/i.test(normalizedResume)
  };

  let formattingScore = 0;
  if (hasEmail) formattingScore += 15;
  if (hasPhone) formattingScore += 15;
  if (hasLinkedIn) formattingScore += 10;
  if (hasGitHub) formattingScore += 10;
  
  // Section points
  let sectionCount = 0;
  Object.values(sections).forEach(present => {
    if (present) sectionCount++;
  });
  formattingScore += (sectionCount * 10); // Max 50 points

  // 3. Readability & Style Checks
  const words = resumeText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  
  // Estimate sentences (split by periods, exclamation, questions followed by space or end)
  const sentences = resumeText.split(/[.!?](?=\s|$)/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;
  const avgSentenceLength = Math.round(wordCount / sentenceCount);

  // Count bullets
  const bulletCount = (resumeText.match(/[•\-\*]/g) || []).length;

  let readabilityScore = 100;
  const suggestions = [];

  // Analyze word count
  if (wordCount < 200) {
    readabilityScore -= 20;
    suggestions.push({
      category: 'length',
      severity: 'high',
      message: 'Your resume is very short (under 200 words). Add detail to your experience, projects, or skills sections.'
    });
  } else if (wordCount > 1000) {
    readabilityScore -= 15;
    suggestions.push({
      category: 'length',
      severity: 'medium',
      message: 'Your resume is quite long (over 1000 words). Aim to keep it concise, ideally under 2 pages (400-800 words).'
    });
  }

  // Analyze sentence length
  if (avgSentenceLength > 25) {
    readabilityScore -= 15;
    suggestions.push({
      category: 'readability',
      severity: 'medium',
      message: `Your average sentence length is ${avgSentenceLength} words, which is a bit high. Shorten sentences to make your resume punchier.`
    });
  }

  // Analyze bullets
  if (bulletCount < 5) {
    readabilityScore -= 15;
    suggestions.push({
      category: 'style',
      severity: 'high',
      message: 'Too few bullet points. Use standard bullet points (•, -) to format your work experience and make it scannable.'
    });
  }

  // Formatting suggestions
  if (!hasEmail) {
    suggestions.push({
      category: 'contact',
      severity: 'high',
      message: 'Contact email not found. Make sure your email is clearly visible at the top of the resume.'
    });
  }
  if (!hasPhone) {
    suggestions.push({
      category: 'contact',
      severity: 'medium',
      message: 'Phone number not found. Consider adding your phone number for recruiters.'
    });
  }
  if (!hasLinkedIn) {
    suggestions.push({
      category: 'contact',
      severity: 'medium',
      message: 'LinkedIn profile link not found. Recruiters frequently look for LinkedIn profiles to verify experience.'
    });
  }
  
  // Section suggestions
  if (!sections.summary) {
    suggestions.push({
      category: 'structure',
      severity: 'low',
      message: 'Consider adding a professional summary or profile at the top to summarize your value proposition.'
    });
  }
  if (!sections.experience) {
    suggestions.push({
      category: 'structure',
      severity: 'high',
      message: 'Professional Experience section not found. Ensure you have a section dedicated to your work history.'
    });
  }
  if (!sections.skills) {
    suggestions.push({
      category: 'structure',
      severity: 'high',
      message: 'Skills section not found. Create a dedicated section listing your key tools and technologies.'
    });
  }

  // Keyword suggestions
  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 5);
    suggestions.push({
      category: 'keywords',
      severity: 'high',
      message: `Incorporate these key skills from the job description: ${topMissing.join(', ')}.`
    });
  }

  // Calculate Overall ATS Score (weighted)
  // 50% keyword match, 30% formatting & contact, 20% readability
  const atsScore = Math.round(
    (keywordMatchPercent * 0.5) + 
    (formattingScore * 0.3) + 
    (readabilityScore * 0.2)
  );

  return {
    atsScore: Math.max(0, Math.min(100, atsScore)),
    breakdown: {
      keywordScore: keywordMatchPercent,
      formattingScore: Math.round((formattingScore / 100) * 100),
      readabilityScore: Math.max(0, readabilityScore)
    },
    keywords: {
      present: presentKeywords,
      missing: missingKeywords,
      all: jdKeywords
    },
    structure: {
      emailFound: hasEmail,
      phoneFound: hasPhone,
      linkedInFound: hasLinkedIn,
      gitHubFound: hasGitHub,
      sections
    },
    metrics: {
      wordCount,
      sentenceCount,
      avgSentenceLength,
      bulletCount
    },
    suggestions
  };
}
