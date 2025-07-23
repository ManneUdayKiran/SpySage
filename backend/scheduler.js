require("dotenv").config();
const mongoose = require("mongoose");
const cron = require("node-cron");
const { runAllScrapers } = require("./services/scraperRunner");
const { sendWeeklyDigest } = require("./services/email");
const { sendAdminNotification } = require("./services/email");
const { updateAllCompetitorBuzz } = require("./services/scraperRunner");
const Change = require("./models/Change");

let scraperTask = null;
let buzzTask = null;
let weeklyDigestTask = null;
let isSchedulerRunning = false;

async function connectDBIfNeeded() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
}

async function scheduledJob() {
  console.log(`[${new Date().toISOString()}] Running scheduled scraper job...`);
  await runAllScrapers();
}

function startScheduler() {
  if (isSchedulerRunning) return false;
  connectDBIfNeeded().then(() => {
    // Scraper job: every day at 8am
    scraperTask = cron.schedule("0 8 * * *", async () => {
      try {
        await sendAdminNotification(
          "Scheduler: Scraper Job Started",
          `Scraper job started at ${new Date().toISOString()}`
        );
        await scheduledJob();
        await sendAdminNotification(
          "Scheduler: Scraper Job Completed",
          `Scraper job completed at ${new Date().toISOString()}`
        );
      } catch (err) {
        await sendAdminNotification(
          "Scheduler: Scraper Job Error",
          `Error: ${err.message || err}`
        );
      }
    });
    // Buzz update job: every hour
    buzzTask = cron.schedule("0 * * * *", async () => {
      try {
        console.log(
          `[${new Date().toISOString()}] Running scheduled buzz update job...`
        );
        await updateAllCompetitorBuzz();
        console.log("Buzz update completed.");
      } catch (err) {
        console.error("Buzz update job error:", err.message || err);
      }
    });
    // Weekly digest job: every Monday at 9am
    weeklyDigestTask = cron.schedule("0 9 * * 1", async () => {
      try {
        await sendAdminNotification(
          "Scheduler: Weekly Digest Started",
          `Weekly digest started at ${new Date().toISOString()}`
        );
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const changes = await Change.find({
          detectedAt: { $gte: oneWeekAgo },
        }).populate("competitor");
        await sendWeeklyDigest(changes);
        await sendAdminNotification(
          "Scheduler: Weekly Digest Completed",
          `Weekly digest completed at ${new Date().toISOString()}`
        );
      } catch (err) {
        await sendAdminNotification(
          "Scheduler: Weekly Digest Error",
          `Error: ${err.message || err}`
        );
      }
    });
    isSchedulerRunning = true;
    console.log("Scheduler started. Scraper will run every day at 8am.");
  });
  return true;
}

function stopScheduler() {
  if (!isSchedulerRunning) return false;
  if (scraperTask) scraperTask.stop();
  if (buzzTask) buzzTask.stop();
  if (weeklyDigestTask) weeklyDigestTask.stop();
  isSchedulerRunning = false;
  console.log("Scheduler stopped.");
  return true;
}

function isSchedulerActive() {
  return isSchedulerRunning;
}

module.exports = {
  startScheduler,
  stopScheduler,
  isSchedulerActive,
};
