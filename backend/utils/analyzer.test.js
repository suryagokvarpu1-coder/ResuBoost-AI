import test from 'node:test';
import assert from 'node:assert/strict';
import { extractKeywords, analyzeResumeLocally } from './analyzer.js';

test('Keyword Extraction Tests', async (t) => {
  await t.test('should extract simple technical keywords case-insensitively', () => {
    const text = 'Experienced React developer with strong Python and SQL skills.';
    const keywords = extractKeywords(text);
    
    assert.ok(keywords.includes('react'));
    assert.ok(keywords.includes('python'));
    assert.ok(keywords.includes('sql'));
    assert.strictEqual(keywords.length, 3);
  });

  await t.test('should correctly extract keywords containing punctuation (C++, C#)', () => {
    const text = 'Backend developer with expertise in C++ and C# programming.';
    const keywords = extractKeywords(text);
    
    assert.ok(keywords.includes('c++'));
    assert.ok(keywords.includes('c#'));
    // Make sure it doesn't extract 'c' by mistake if it is not in COMMON_KEYWORDS
    assert.ok(!keywords.includes('c'));
  });

  await t.test('should correctly extract keywords containing dots and slashes (Next.js, Nest.js, CI/CD)', () => {
    const text = 'Build full-stack applications with Next.js, and deploy via a modern CI/CD pipeline.';
    const keywords = extractKeywords(text);
    
    assert.ok(keywords.includes('next.js'));
    assert.ok(keywords.includes('ci/cd') || keywords.includes('cicd'));
  });

  await t.test('should respect technical boundaries (avoid matching substrings like "Java" in "JavaScript")', () => {
    const text = 'I write JavaScript code.';
    const keywords = extractKeywords(text);
    
    assert.ok(keywords.includes('javascript'));
    assert.ok(!keywords.includes('java')); // should not match substring
  });
});

test('Local Resume Analyzer Tests', async (t) => {
  await t.test('should analyze resume against a job description locally', () => {
    const resumeText = `
      John Doe
      john.doe@gmail.com | 123-456-7890
      linkedin.com/in/johndoe | github.com/johndoe
      
      EXPERIENCE
      React Developer at WebSolutions (2022 - Present)
      - Developed user interfaces using React, JavaScript, and HTML5/CSS3.
      
      EDUCATION
      B.S. in Computer Science
      
      SKILLS
      React, JavaScript, SQL, HTML, CSS, Git
    `;
    
    const jdText = `
      We are looking for a React Developer with experience in React, JavaScript, TypeScript, and SQL.
      Must know Git and CI/CD pipelines.
    `;
    
    const result = analyzeResumeLocally(resumeText, jdText);
    
    // Check score structure
    assert.ok(typeof result.atsScore === 'number');
    assert.ok(result.atsScore >= 0 && result.atsScore <= 100);
    
    // Check breakdown existence
    assert.ok(result.breakdown);
    assert.ok(typeof result.breakdown.keywordScore === 'number');
    assert.ok(typeof result.breakdown.formattingScore === 'number');
    assert.ok(typeof result.breakdown.readabilityScore === 'number');
    
    // Check keyword overlap metrics
    assert.ok(result.keywords);
    assert.ok(Array.isArray(result.keywords.present));
    assert.ok(Array.isArray(result.keywords.missing));
    
    assert.ok(result.keywords.present.includes('react'));
    assert.ok(result.keywords.present.includes('javascript'));
    assert.ok(result.keywords.present.includes('sql'));
    assert.ok(result.keywords.missing.includes('typescript'));
    
    // Check structure checklist
    assert.strictEqual(result.structure.emailFound, true);
    assert.strictEqual(result.structure.phoneFound, true);
    assert.strictEqual(result.structure.linkedInFound, true);
    assert.strictEqual(result.structure.gitHubFound, true);
    assert.strictEqual(result.structure.sections.experience, true);
    assert.strictEqual(result.structure.sections.education, true);
    assert.strictEqual(result.structure.sections.skills, true);
  });

  await t.test('should handle empty or malformed inputs gracefully without throwing', () => {
    const resultEmpty = analyzeResumeLocally('', '');
    assert.ok(resultEmpty.atsScore >= 0);
    assert.ok(Array.isArray(resultEmpty.suggestions));
    
    const resultNull = analyzeResumeLocally('A minimal resume', 'Minimal job');
    assert.ok(resultNull.atsScore >= 0);
    assert.ok(resultNull.metrics.wordCount > 0);
  });
});
