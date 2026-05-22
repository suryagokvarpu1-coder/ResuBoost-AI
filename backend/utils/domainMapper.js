import { DOMAINS } from '../data/careersData.js';

/**
 * Maps a raw, AI-generated or user-input domain string to a strict, canonical
 * backend domain key present in the DOMAINS database.
 * 
 * @param {string} rawDomain - The unformatted domain string (e.g., "Architecture", "Medicine", "Civil Engineer")
 * @returns {string} The canonical domain key (e.g., "civil_architecture")
 */
export function mapToCanonicalDomain(rawDomain) {
  if (!rawDomain || typeof rawDomain !== 'string') {
    return 'software_it'; // Default fallback if completely missing
  }

  const normalized = rawDomain.toLowerCase().trim();

  // 1. Direct match with existing keys
  if (DOMAINS[normalized]) {
    return normalized;
  }

  // 2. Keyword-based heuristic mapping
  const keywordMap = {
    software_it: ['software', 'it ', 'computer science', 'programming', 'developer', 'frontend', 'backend', 'fullstack', 'cybersecurity', 'devops', 'cse'],
    hardware_embedded: ['hardware', 'embedded', 'vlsi', 'iot', 'pcb', 'electronics', 'ece'],
    ai_data_science: ['ai', 'data science', 'machine learning', 'ml', 'nlp', 'computer vision', 'data engineer', 'analytics'],
    legal: ['law', 'legal', 'lawyer', 'judiciary', 'advocate', 'litigation', 'corporate law', 'ip law'],
    medical_healthcare: ['medical', 'health', 'doctor', 'surgery', 'clinical', 'pharma', 'dentist', 'nurse', 'hospital'],
    civil_architecture: ['architecture', 'architect', 'civil', 'construction', 'structural', 'urban planning', 'building'],
    defense_security: ['defense', 'security', 'army', 'navy', 'air force', 'police', 'paramilitary', 'military'],
    government: ['government', 'govt', 'upsc', 'ias', 'ssc', 'railway', 'public administration'],
    business_entrepreneurship: ['business', 'entrepreneur', 'startup', 'management', 'mba', 'product manager', 'consulting', 'operations'],
    banking_finance: ['banking', 'finance', 'fintech', 'accounting', 'chartered accountant', 'ca', 'cfa', 'investment'],
    marketing_media: ['marketing', 'media', 'journalism', 'content', 'advertising', 'brand', 'digital marketing'],
    teaching_research: ['teaching', 'research', 'education', 'academia', 'professor', 'teacher', 'school', 'lecturer'],
    skilled_vocational: ['skilled', 'vocational', 'electrician', 'welder', 'plumber', 'technician', 'mechanic', 'salon'],
    freelancing: ['freelance', 'remote', 'gig', 'independent', 'consultant']
  };

  for (const [canonicalKey, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => normalized.includes(kw))) {
      return canonicalKey;
    }
  }

  // 3. Fallback: Return software_it if no match is found, though with AI passing strict keys, 
  // this should rarely be hit.
  return 'software_it';
}
