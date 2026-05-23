import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Safely executes a prompt using multiple fallback Gemini models.
 * @param {string} clientApiKey - Dynamically provided client API key (optional)
 * @param {Array|string} promptParts - The prompt string or array of parts
 * @returns {Promise<import('@google/generative-ai').GenerateContentResult>}
 */
export async function executeWithGeminiFallback(clientApiKey, promptParts) {
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const result = await model.generateContent(promptParts);
      return result;
    } catch (err) {
      lastError = err;
      const errorMsg = (err.message || '').toLowerCase();
      
      // If the error is 404 Not Found, or unsupported model, try the next model
      if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('not supported') || errorMsg.includes('is not valid')) {
        console.warn(`[Gemini Fallback] Model ${modelName} failed: ${err.message}. Trying next model...`);
        continue;
      }
      
      // If it's a JSON mimetype error, try again without generationConfig for this specific model
      if (errorMsg.includes('json') || errorMsg.includes('responsemimetype')) {
        try {
          console.warn(`[Gemini Fallback] Model ${modelName} rejected JSON mimetype. Retrying without it...`);
          const fallbackModel = genAI.getGenerativeModel({ model: modelName });
          const result = await fallbackModel.generateContent(promptParts);
          return result;
        } catch (innerErr) {
          lastError = innerErr;
          continue; // still fail over to the next model
        }
      }

      // If it's a quota exceeded or invalid key, we should NOT fallback to other models, as they will also fail.
      if (errorMsg.includes('quota') || errorMsg.includes('429')) {
        throw new Error('QUOTA_EXCEEDED');
      }
      if (errorMsg.includes('api key not valid') || errorMsg.includes('invalid') || errorMsg.includes('400')) {
        throw new Error('INVALID_API_KEY');
      }

      // For other generic API errors (e.g., 500, 503), we might want to try the next model just in case it's a regional model outage
      console.warn(`[Gemini Fallback] Model ${modelName} encountered generic error: ${err.message}. Trying next model...`);
    }
  }

  // If all failed
  if (lastError.message === 'API_KEY_MISSING' || lastError.message === 'QUOTA_EXCEEDED' || lastError.message === 'INVALID_API_KEY') {
    throw lastError;
  }
  
  throw new Error(`MODEL_UNAVAILABLE: All models failed. Last error: ${lastError.message}`);
}

/**
 * Safely cleans and parses JSON responses from Gemini, stripping any markdown wrapper blocks if returned.
 * @param {string} text
 * @returns {object}
 */
export function cleanJsonResponse(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9]*\s*/, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned.trim());
}
