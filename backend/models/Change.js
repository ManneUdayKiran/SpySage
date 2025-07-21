const mongoose = require("mongoose");

const ChangeSchema = new mongoose.Schema({
  competitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Competitor",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String }, // e.g., 'UI', 'Pricing', 'Feature', etc.
  summary: { type: String },
  details: { type: String },
  url: { type: String },
  detectedAt: { type: Date, default: Date.now },
  diff: { type: mongoose.Schema.Types.Mixed }, // can store text or image diff info
  impact: { type: String }, // e.g., 'High', 'Medium', 'Low'
  tags: [{ type: String }],
  category: { type: String, default: "" },
  beforeScreenshot: { type: String, default: "" },
  afterScreenshot: { type: String, default: "" },
});

module.exports = mongoose.model("Change", ChangeSchema);
