// Helper function to get system API keys (since user API keys are no longer used)
async function getUserApiKeys(userId, requiredKeys = []) {
  // Always return system keys now
  return getSystemKeys(requiredKeys);
}

// Get system/default keys from environment
function getSystemKeys(keys) {
  const systemKeys = {
    groqApiKey: process.env.GROQ_API_KEY,
    notionApiKey: process.env.NOTION_API_KEY,
    notionDatabaseId: process.env.NOTION_DATABASE_ID,
    slackBotToken: process.env.SLACK_BOT_TOKEN,
    slackChannelId: process.env.SLACK_CHANNEL_ID,
    emailUser: process.env.EMAIL_USER,
    emailPass: process.env.EMAIL_PASS,
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    twitterBearerToken: process.env.TWITTER_BEARER_TOKEN,
  };

  if (!keys || keys.length === 0) {
    return systemKeys;
  }

  const result = {};
  keys.forEach((key) => {
    result[key] = systemKeys[key];
  });

  return result;
}

// Check if system API keys are available (always true since we use system keys)
async function hasUserApiKeys(userId, keys) {
  try {
    const systemKeys = getSystemKeys(keys);
    return keys.every(
      (key) => systemKeys[key] !== null && systemKeys[key] !== undefined
    );
  } catch (error) {
    return false;
  }
}

module.exports = {
  getUserApiKeys,
  hasUserApiKeys,
  getSystemKeys,
};
