const UserApiKeys = require("../models/UserApiKeys");

// Helper function to get user's API keys or fall back to system keys
async function getUserApiKeys(userId, requiredKeys = []) {
  try {
    if (!userId) {
      // If no user ID, return system keys for required services
      return getSystemKeys(requiredKeys);
    }

    const userKeys = await UserApiKeys.findOne({ userId });
    if (!userKeys) {
      return getSystemKeys(requiredKeys);
    }

    const decryptedKeys = {
      groqApiKey: userKeys.groqApiKey
        ? userKeys.decryptKey(userKeys.groqApiKey)
        : null,
      notionApiKey: userKeys.notionApiKey
        ? userKeys.decryptKey(userKeys.notionApiKey)
        : null,
      notionDatabaseId: userKeys.notionDatabaseId || null,
      slackBotToken: userKeys.slackBotToken
        ? userKeys.decryptKey(userKeys.slackBotToken)
        : null,
      slackChannelId: userKeys.slackChannelId || null,
      emailUser: userKeys.emailUser || null,
      emailPass: userKeys.emailPass
        ? userKeys.decryptKey(userKeys.emailPass)
        : null,
      openRouterApiKey: userKeys.openRouterApiKey
        ? userKeys.decryptKey(userKeys.openRouterApiKey)
        : null,
      twitterBearerToken: userKeys.twitterBearerToken
        ? userKeys.decryptKey(userKeys.twitterBearerToken)
        : null,
    };

    // For each required key, fall back to system key if user key is not available
    const finalKeys = {};
    const systemKeys = getSystemKeys(requiredKeys);

    requiredKeys.forEach((key) => {
      finalKeys[key] = decryptedKeys[key] || systemKeys[key] || null;
    });

    return finalKeys;
  } catch (error) {
    console.error("Error getting user API keys:", error);
    return getSystemKeys(requiredKeys);
  }
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

// Check if user has configured specific API keys
async function hasUserApiKeys(userId, keys) {
  try {
    const userKeys = await getUserApiKeys(userId, keys);
    return keys.every((key) => userKeys[key] !== null);
  } catch (error) {
    return false;
  }
}

module.exports = {
  getUserApiKeys,
  hasUserApiKeys,
  getSystemKeys,
};
