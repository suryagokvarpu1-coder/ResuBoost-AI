import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('No GEMINI_API_KEY set.');
      process.exit(1);
    }
    
    // Test direct fetch to models list using regular fetch
    console.log('Fetching models from REST API...');
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!res.ok) {
        console.error('Failed to fetch models:', await res.text());
    } else {
        const data = await res.json();
        const supported = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
        console.log('Supported models for generateContent:');
        supported.forEach(m => console.log(' -', m.name));
    }
    
    // Test the SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // or try different ones
    
    console.log('Done testing.');
  } catch (err) {
    console.error(err);
  }
}

run();
