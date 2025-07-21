const mongoose = require("mongoose");

const CompetitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  website: { type: String, required: true },
  changelogUrl: { type: String },
  socialLinks: [{ type: String }],
  tags: [{ type: String }],
  buzz: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Competitor", CompetitorSchema);
