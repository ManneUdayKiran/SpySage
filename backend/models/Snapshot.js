const mongoose = require('mongoose');

const SnapshotSchema = new mongoose.Schema({
  competitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Competitor', required: true },
  url: { type: String },
  html: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Snapshot', SnapshotSchema); 