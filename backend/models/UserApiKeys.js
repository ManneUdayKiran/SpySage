const mongoose = require("mongoose");
const crypto = require("crypto");

const userApiKeysSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Encrypted API keys
  groqApiKey: {
    type: String,
    default: null,
  },
  notionApiKey: {
    type: String,
    default: null,
  },
  notionDatabaseId: {
    type: String,
    default: null,
  },
  slackBotToken: {
    type: String,
    default: null,
  },
  slackChannelId: {
    type: String,
    default: null,
  },
  emailUser: {
    type: String,
    default: null,
  },
  emailPass: {
    type: String,
    default: null,
  },
  openRouterApiKey: {
    type: String,
    default: null,
  },
  twitterBearerToken: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Encryption/Decryption methods
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const IV_LENGTH = 16;

userApiKeysSchema.methods.encryptKey = function (text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher("aes-256-cbc", ENCRYPTION_KEY);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

userApiKeysSchema.methods.decryptKey = function (text) {
  if (!text) return null;
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = textParts.join(":");
  const decipher = crypto.createDecipher("aes-256-cbc", ENCRYPTION_KEY);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// Auto-update timestamp
userApiKeysSchema.pre("save", function () {
  this.updatedAt = new Date();
});

module.exports = mongoose.model("UserApiKeys", userApiKeysSchema);
