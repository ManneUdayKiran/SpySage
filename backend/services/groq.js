const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
// Groq chat completions endpoint
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function summarizeTextWithGroq(text) {
  try {
    const truncatedText = text.length > 8000 ? text.slice(0, 8000) : text;
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'gemma2-9b-it',
        messages: [
          { role: 'system', content: 'You are an expert product manager assistant. Summarize the following product changelog or update in 1-2 sentences, focusing on what changed and its impact.' },
          { role: 'user', content: truncatedText },
        ],
        max_tokens: 256,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('Groq summarization error:', err.response?.data || err.message);
    return null;
  }
}

async function categorizeChangeWithOpenRouter(summary) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OpenRouter API key');
  const prompt = `Categorize the following product update as one of: UI, pricing, feature, performance.\n\nUpdate: ${summary}\n\nCategory:`;
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert product manager.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 10,
      temperature: 0,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  // Extract the category from the response
  const text = response.data.choices?.[0]?.message?.content?.trim() || '';
  // Only allow known categories
  const allowed = ['UI', 'pricing', 'feature', 'performance'];
  const found = allowed.find(cat => text.toLowerCase().includes(cat));
  return found || 'other';
}

module.exports = {
  summarizeTextWithGroq,
  categorizeChangeWithOpenRouter,
}; 