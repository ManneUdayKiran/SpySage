const axios = require('axios');

// You need to set your Twitter Bearer Token in your environment variables
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

async function getBuzzCount(keyword) {
  if (!BEARER_TOKEN) throw new Error('Twitter Bearer Token not set');
  const endpoint = 'https://api.twitter.com/2/tweets/search/recent';
  const query = encodeURIComponent(keyword);
  // You can adjust the query to be more specific (e.g., include website, hashtags, etc.)
  const url = `${endpoint}?query=${query}&max_results=100`;
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
      },
    });
    // Return the number of tweets found
    return response.data.meta ? response.data.meta.result_count : 0;
  } catch (err) {
    console.error('Error fetching Twitter buzz:', err.response?.data || err.message);
    return 0;
  }
}

module.exports = { getBuzzCount }; 