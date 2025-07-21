const express = require("express");
const UserApiKeys = require("../models/UserApiKeys");
const jwt = require("jsonwebtoken");
const { hasUserApiKeys } = require("../utils/apiKeyHelper");

const router = express.Router();

// Middleware to require JWT auth
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// Get user's API keys (returns masked keys for security)
router.get("/", requireAuth, async (req, res) => {
  try {
    const userKeys = await UserApiKeys.findOne({ userId: req.userId });

    if (!userKeys) {
      return res.json({
        groqApiKey: null,
        notionApiKey: null,
        notionDatabaseId: null,
        slackBotToken: null,
        slackChannelId: null,
        emailUser: null,
        emailPass: null,
        openRouterApiKey: null,
        twitterBearerToken: null,
      });
    }

    // Return masked versions for security
    const maskedKeys = {
      groqApiKey: userKeys.groqApiKey
        ? maskApiKey(userKeys.decryptKey(userKeys.groqApiKey))
        : null,
      notionApiKey: userKeys.notionApiKey
        ? maskApiKey(userKeys.decryptKey(userKeys.notionApiKey))
        : null,
      notionDatabaseId: userKeys.notionDatabaseId || null,
      slackBotToken: userKeys.slackBotToken
        ? maskApiKey(userKeys.decryptKey(userKeys.slackBotToken))
        : null,
      slackChannelId: userKeys.slackChannelId || null,
      emailUser: userKeys.emailUser || null,
      emailPass: userKeys.emailPass ? "********" : null,
      openRouterApiKey: userKeys.openRouterApiKey
        ? maskApiKey(userKeys.decryptKey(userKeys.openRouterApiKey))
        : null,
      twitterBearerToken: userKeys.twitterBearerToken
        ? maskApiKey(userKeys.decryptKey(userKeys.twitterBearerToken))
        : null,
    };

    res.json(maskedKeys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user's API keys
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      groqApiKey,
      notionApiKey,
      notionDatabaseId,
      slackBotToken,
      slackChannelId,
      emailUser,
      emailPass,
      openRouterApiKey,
      twitterBearerToken,
    } = req.body;

    let userKeys = await UserApiKeys.findOne({ userId: req.userId });

    if (!userKeys) {
      userKeys = new UserApiKeys({ userId: req.userId });
    }

    // Encrypt and save keys
    if (groqApiKey && groqApiKey !== "********") {
      userKeys.groqApiKey = userKeys.encryptKey(groqApiKey);
    }
    if (notionApiKey && notionApiKey !== "********") {
      userKeys.notionApiKey = userKeys.encryptKey(notionApiKey);
    }
    if (notionDatabaseId) {
      userKeys.notionDatabaseId = notionDatabaseId;
    }
    if (slackBotToken && slackBotToken !== "********") {
      userKeys.slackBotToken = userKeys.encryptKey(slackBotToken);
    }
    if (slackChannelId) {
      userKeys.slackChannelId = slackChannelId;
    }
    if (emailUser) {
      userKeys.emailUser = emailUser;
    }
    if (emailPass && emailPass !== "********") {
      userKeys.emailPass = userKeys.encryptKey(emailPass);
    }
    if (openRouterApiKey && openRouterApiKey !== "********") {
      userKeys.openRouterApiKey = userKeys.encryptKey(openRouterApiKey);
    }
    if (twitterBearerToken && twitterBearerToken !== "********") {
      userKeys.twitterBearerToken = userKeys.encryptKey(twitterBearerToken);
    }

    await userKeys.save();

    res.json({ success: true, message: "API keys updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get decrypted keys for internal use
router.getDecryptedKeys = async (userId) => {
  try {
    const userKeys = await UserApiKeys.findOne({ userId });
    if (!userKeys) return null;

    return {
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
  } catch (err) {
    console.error("Error getting decrypted keys:", err);
    return null;
  }
};

// Helper function to mask API keys
function maskApiKey(key) {
  if (!key) return null;
  if (key.length <= 8) return "********";
  return key.substring(0, 4) + "..." + key.substring(key.length - 4);
}

// Check service availability
router.get("/availability", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;

    const services = {
      groq: await hasUserApiKeys(userId, ["groqApiKey"]),
      notion: await hasUserApiKeys(userId, [
        "notionApiKey",
        "notionDatabaseId",
      ]),
      slack: await hasUserApiKeys(userId, ["slackBotToken", "slackChannelId"]),
      email: await hasUserApiKeys(userId, ["emailUser", "emailPass"]),
      twitter: await hasUserApiKeys(userId, ["twitterBearerToken"]),
      openRouter: await hasUserApiKeys(userId, ["openRouterApiKey"]),
    };

    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user's API keys
router.delete("/", requireAuth, async (req, res) => {
  try {
    await UserApiKeys.deleteOne({ userId: req.userId });
    res.json({ success: true, message: "API keys deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
