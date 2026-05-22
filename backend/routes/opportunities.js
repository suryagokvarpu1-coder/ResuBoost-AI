import express from 'express';
import { matchOpportunitiesToProfile } from '../services/careerService.js';

const router = express.Router();

// POST /api/opportunities/match — AI opportunity matching
router.post('/match', async (req, res) => {
  try {
    const { userProfile, opportunityType } = req.body;
    if (!userProfile) return res.status(400).json({ error: 'User profile required.' });

    const clientApiKey = req.headers['x-api-key'] || '';
    const hasApiKey = !!(clientApiKey || process.env.GEMINI_API_KEY);

    if (!hasApiKey) {
      // Static fallback opportunities
      const fallbackOpportunities = generateStaticOpportunities(userProfile, opportunityType);
      return res.json({
        isAI: false,
        ...fallbackOpportunities,
        warning: 'Add Gemini API key for AI-matched personalized opportunities.'
      });
    }

    const result = await matchOpportunitiesToProfile(userProfile, opportunityType, clientApiKey);
    res.json({ ...result, isAI: true });
  } catch (err) {
    console.error('Opportunity Match Error:', err);
    res.status(500).json({ error: 'Opportunity matching failed.', details: err.message });
  }
});

// GET /api/opportunities/platforms — Return job platforms list
router.get('/platforms', (req, res) => {
  res.json({ platforms: JOB_PLATFORMS });
});

function generateStaticOpportunities(userProfile, opportunityType) {
  const domain = userProfile.domain || 'general_professional';
  const experience = userProfile.experience || 'Fresher';
  
  const opportunityMap = {
    software_it: [
      { id: 'opp1', title: 'Software Engineer Intern', company: 'Tech Startup (via Internshala)', type: 'Internship', location: 'Remote', salary: '₹10,000–25,000/mo', experience: 'Fresher', skills: ['JavaScript', 'React', 'Git'], matchScore: 88, matchReason: 'Your skills align well with startup frontend requirements', applyVia: 'Internshala', deadline: 'Ongoing', description: 'Build and maintain web applications using React. Collaborative and learning-focused team.', benefits: 'Remote, Certificate, PPO possible', growthPotential: 'High', isGovernment: false },
      { id: 'opp2', title: 'Full Stack Developer', company: 'Mid-size Product Company', type: 'Job', location: 'Bangalore / Remote', salary: '₹8–15 LPA', experience: '0–2 years', skills: ['Node.js', 'React', 'MongoDB', 'REST APIs'], matchScore: 82, matchReason: 'Full-stack role matching your development background', applyVia: 'LinkedIn/Naukri', deadline: 'Ongoing', description: 'Develop full-stack features for SaaS product used by 10,000+ businesses.', benefits: 'Health insurance, Remote-friendly, ESOP', growthPotential: 'Very High', isGovernment: false },
      { id: 'opp3', title: 'Junior Software Developer – Government PSU', company: 'CDAC / NIC / ISRO', type: 'Government', location: 'Multiple cities across India', salary: '₹35,000–55,000/mo', experience: 'BE/B.Tech CS/IT', skills: ['Java', 'Python', 'Linux', 'Databases'], matchScore: 75, matchReason: 'Government tech organizations hire computer science graduates directly', applyVia: 'Official PSU/CDAC portal', deadline: 'Check official notification', description: 'Develop and maintain government digital infrastructure projects.', benefits: 'Job security, Pension, Leave benefits, Housing allowance', growthPotential: 'Stable', isGovernment: true },
    ],
    government: [
      { id: 'opp4', title: 'UPSC CSE 2025 – Civil Services', company: 'Government of India (UPSC)', type: 'Government', location: 'Pan India', salary: '₹56,100–2,50,000/mo + DA + HRA', experience: 'Any Graduate', skills: ['General Studies', 'CSAT', 'Optional Subject', 'Essay'], matchScore: 90, matchReason: 'Open to all graduates across all disciplines', applyVia: 'upsc.gov.in', deadline: 'Feb 2025 (Prelims)', description: 'Most prestigious civil services examination leading to IAS, IPS, IFS roles.', benefits: 'Power, prestige, social impact, complete govt. perks', growthPotential: 'High', isGovernment: true },
      { id: 'opp5', title: 'SSC CGL 2025 – Group B/C Posts', company: 'Staff Selection Commission', type: 'Government', location: 'Pan India', salary: '₹25,500–1,42,400/mo', experience: 'Any Graduate', skills: ['Quantitative Aptitude', 'English', 'GK', 'Reasoning'], matchScore: 85, matchReason: 'Suitable for any graduate seeking central govt employment', applyVia: 'ssc.gov.in', deadline: 'Annually', description: 'Recruitment to Income Tax, CBI, Auditor, Accountant, and similar posts.', benefits: 'Job security, Government benefits, Good work-life balance', growthPotential: 'Stable', isGovernment: true },
    ],
    ai_data_science: [
      { id: 'opp6', title: 'Machine Learning Engineer Intern', company: 'AI Startup (via AngelList)', type: 'Internship', location: 'Remote', salary: '₹15,000–40,000/mo', experience: 'Fresher/1 year', skills: ['Python', 'TensorFlow/PyTorch', 'SQL', 'Statistics'], matchScore: 90, matchReason: 'Strong AI/ML domain match', applyVia: 'Internshala/Wellfound', deadline: 'Ongoing', description: 'Build ML models and data pipelines for early-stage AI product.', benefits: 'Mentorship, Equity consideration, Remote', growthPotential: 'Very High', isGovernment: false },
    ],
    civil_architecture: [
      { id: 'opp7', title: 'Junior Architect', company: 'Top Tier Design Studio', type: 'Job', location: 'Mumbai / Bangalore', salary: '₹4–8 LPA', experience: '0–2 years', skills: ['AutoCAD', 'SketchUp', 'Revit', 'Lumion'], matchScore: 85, matchReason: 'Excellent match for architecture freshers with CAD skills', applyVia: 'LinkedIn/Company Website', deadline: 'Ongoing', description: 'Assist senior architects in drafting, 3D modeling, and site coordination.', benefits: 'Creative environment, exposure to large-scale projects', growthPotential: 'High', isGovernment: false },
      { id: 'opp8', title: 'Site Engineer', company: 'L&T Construction', type: 'Job', location: 'Pan India', salary: '₹5–9 LPA', experience: '1–3 years', skills: ['Project Management', 'Quality Control', 'AutoCAD', 'Structural Analysis'], matchScore: 80, matchReason: 'Matches your core civil engineering background', applyVia: 'L&T Careers', deadline: 'Ongoing', description: 'Manage on-site construction activities, ensuring safety and structural integrity.', benefits: 'Job security, site allowances', growthPotential: 'High', isGovernment: false },
    ],
    medical_healthcare: [
      { id: 'opp9', title: 'Resident Medical Officer (RMO)', company: 'Apollo Hospitals', type: 'Job', location: 'Delhi / Chennai', salary: '₹6–12 LPA', experience: 'MBBS Fresher', skills: ['Clinical Care', 'Emergency Medicine', 'Patient Management'], matchScore: 92, matchReason: 'Direct alignment with your MBBS qualification', applyVia: 'Hospital Portal', deadline: 'Ongoing', description: 'Provide primary clinical care, assist in emergencies and ward management.', benefits: 'Excellent clinical exposure, shift allowances', growthPotential: 'Very High', isGovernment: false },
    ],
    legal: [
      { id: 'opp10', title: 'Legal Associate', company: 'Tier-1 Law Firm', type: 'Job', location: 'Delhi NCR / Mumbai', salary: '₹8–15 LPA', experience: '0–2 years', skills: ['Corporate Law', 'Drafting', 'Due Diligence', 'Research'], matchScore: 88, matchReason: 'Great starting role for law graduates', applyVia: 'Firm Website', deadline: 'Ongoing', description: 'Draft contracts, assist in M&A due diligence, and conduct legal research.', benefits: 'High salary, prestigious career path', growthPotential: 'Extremely High', isGovernment: false },
    ],
    business_entrepreneurship: [
      { id: 'opp11', title: 'Business Analyst', company: 'Deloitte / KPMG', type: 'Job', location: 'Bangalore / Gurugram', salary: '₹6–12 LPA', experience: '0–2 years', skills: ['Excel', 'Data Analysis', 'Market Research', 'Presentation'], matchScore: 86, matchReason: 'Strong match for MBA/BBA graduates', applyVia: 'LinkedIn', deadline: 'Ongoing', description: 'Analyze business requirements, create reports, and support strategy teams.', benefits: 'Global exposure, rapid career growth', growthPotential: 'Very High', isGovernment: false },
    ],
    general_professional: [
      { id: 'opp12', title: 'General Management Trainee', company: 'Top Corporate', type: 'Job', location: 'Pan India', salary: '₹4–8 LPA', experience: 'Fresher/0-2 years', skills: ['Communication', 'Management', 'Operations'], matchScore: 80, matchReason: 'General professional profile match', applyVia: 'LinkedIn', deadline: 'Ongoing', description: 'Rotational program across different business units.', benefits: 'Fast-track career, learning across departments', growthPotential: 'High', isGovernment: false },
      { id: 'opp13', title: 'UPSC CSE 2025 – Civil Services', company: 'Government of India (UPSC)', type: 'Government', location: 'Pan India', salary: '₹56,100–2,50,000/mo', experience: 'Any Graduate', skills: ['General Studies', 'CSAT', 'Optional Subject', 'Essay'], matchScore: 85, matchReason: 'Open to all graduates', applyVia: 'upsc.gov.in', deadline: 'Feb 2025', description: 'Prestigious civil services examination.', benefits: 'Prestige, social impact, govt perks', growthPotential: 'High', isGovernment: true },
    ]
  };

  const opportunities = opportunityMap[domain] || opportunityMap['general_professional'];
  
  return {
    opportunities: opportunities,
    totalMatches: opportunities.length,
    searchTip: `Visit LinkedIn Jobs, Naukri.com, Internshala, Wellfound (for startups), and ${
      domain === 'government' ? 'sarkariresult.com, upsc.gov.in, ssc.gov.in' : 'AngelList/Wellfound for startup roles'
    } to find similar opportunities.`,
    profileGap: `Add more domain-specific projects to your portfolio to increase match score above 90%.`
  };
}

const JOB_PLATFORMS = [
  { name: 'LinkedIn', type: 'General Professional', bestFor: 'All professional roles, networking', link: 'https://linkedin.com/jobs', icon: '🔗', tag: 'Most Popular' },
  { name: 'Naukri.com', type: 'India Jobs', bestFor: 'Indian job market, experienced professionals', link: 'https://naukri.com', icon: '🏢', tag: 'Top India' },
  { name: 'Internshala', type: 'Internships & Entry-Level', bestFor: 'Students, freshers, internships', link: 'https://internshala.com', icon: '🎓', tag: 'Best for Students' },
  { name: 'Wellfound (AngelList)', type: 'Startup Jobs', bestFor: 'Startup culture, equity, remote roles', link: 'https://wellfound.com', icon: '🚀', tag: 'Startups' },
  { name: 'Upwork', type: 'Freelance', bestFor: 'Freelancers, remote consulting, global clients', link: 'https://upwork.com', icon: '💼', tag: 'Freelance' },
  { name: 'Fiverr', type: 'Freelance', bestFor: 'Service-based freelancing, gig economy', link: 'https://fiverr.com', icon: '🎯', tag: 'Freelance' },
  { name: 'UPSC Portal', type: 'Government', bestFor: 'UPSC civil services, central govt jobs', link: 'https://upsc.gov.in', icon: '🏛️', tag: 'Government' },
  { name: 'SSC Portal', type: 'Government', bestFor: 'SSC CGL, CHSL, MTS, central govt posts', link: 'https://ssc.gov.in', icon: '📋', tag: 'Government' },
  { name: 'RRB Portal', type: 'Government', bestFor: 'Railway recruitment, technical & non-technical', link: 'https://indianrailways.gov.in', icon: '🚂', tag: 'Government' },
  { name: 'NCS Portal (Govt)', type: 'Government', bestFor: 'National Career Service, all govt job listings', link: 'https://ncs.gov.in', icon: '🇮🇳', tag: 'Government Free' },
  { name: 'Glassdoor', type: 'General', bestFor: 'Company research, salary benchmarks', link: 'https://glassdoor.co.in', icon: '🔍', tag: 'Research' },
  { name: 'Indeed India', type: 'General', bestFor: 'Wide variety of jobs across all sectors', link: 'https://indeed.co.in', icon: '🌐', tag: 'General' },
  { name: 'ResearchGate', type: 'Research/Academia', bestFor: 'Research positions, academic collaborations', link: 'https://researchgate.net', icon: '🔬', tag: 'Research' },
  { name: 'Toptal', type: 'Premium Freelance', bestFor: 'Top 3% freelancers, premium global clients', link: 'https://toptal.com', icon: '⭐', tag: 'Elite Freelance' },
];

export default router;
