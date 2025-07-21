const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { runAllScrapers } = require('../services/scraperRunner');

// Mocked service checks (replace with real checks if available)
async function checkNotion() {
  // TODO: Implement real Notion API check
  return true;
}
async function checkSlack() {
  // TODO: Implement real Slack API check
  return true;
}
async function checkEmail() {
  // TODO: Implement real Email check
  return true;
}
async function checkScheduler() {
  // TODO: Implement real Scheduler check (e.g., last run time)
  return true;
}

router.get('/', async (req, res) => {
  try {
    // MongoDB
    const mongo = mongoose.connection.readyState === 1;
    // Other services (mocked)
    const [notion, slack, email, scheduler] = await Promise.all([
      checkNotion(),
      checkSlack(),
      checkEmail(),
      checkScheduler(),
    ]);
    res.json({
      mongo,
      notion,
      slack,
      email,
      scheduler,
    });
  } catch (err) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

router.post('/manual-scrape', async (req, res) => {
  try {
    await runAllScrapers();
    res.json({ success: true, message: 'Manual scrape triggered.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to trigger manual scrape.' });
  }
});

module.exports = router; 