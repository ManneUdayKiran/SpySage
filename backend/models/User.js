const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String }, // Optional for demo, hashed
  competitors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Competitor' }],
  notificationChannels: [{ type: String }], // e.g., ['slack', 'notion', 'email']
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema); 