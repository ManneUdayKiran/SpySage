const express = require('express');
const router = express.Router();
const { startScheduler, stopScheduler, isSchedulerActive } = require('../scheduler');

// Start manual scrape (scheduler)
router.post('/start', (req, res) => {
  const started = startScheduler();
  if (started) {
    res.json({ success: true, message: 'Manual scraper started.' });
  } else {
    res.status(400).json({ success: false, message: 'Manual scraper is already running.' });
  }
});

// Stop manual scrape (scheduler)
router.post('/stop', (req, res) => {
  const stopped = stopScheduler();
  if (stopped) {
    res.json({ success: true, message: 'Manual scraper stopped.' });
  } else {
    res.status(400).json({ success: false, message: 'Manual scraper is not running.' });
  }
});

// Get manual scrape status
router.get('/status', (req, res) => {
  res.json({ running: isSchedulerActive() });
});

module.exports = router; 