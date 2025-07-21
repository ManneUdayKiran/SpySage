const axios = require('axios');
const { categorizeChangeWithOpenRouter } = require('./groq');

async function scrapeCompetitor(competitor) {
  const url = competitor.changelogUrl || competitor.website;
  try {
    const response = await axios.get(url);
    return { html: response.data, urlUsed: url };
  } catch (err) {
    console.error(`Error scraping ${url}:`, err.message);
    return { html: null, urlUsed: url };
  }
}

module.exports = { scrapeCompetitor }; 