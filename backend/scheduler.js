require("dotenv").config();
const mongoose = require("mongoose");
const cron = require("node-cron");
const { runAllScrapers } = require("./services/scraperRunner");
const { sendWeeklyDigest } = require("./services/email");
const { sendAdminNotification } = require("./services/email");
const { updateAllCompetitorBuzz } = require("./services/scraperRunner");
const Change = require("./models/Change");
const User = require("./models/User");
const Competitor = require("./models/Competitor");

let scraperTask = null;
let buzzTask = null;
let hourlyDigestTask = null;
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

    // Hourly email digest job: every hour
    hourlyDigestTask = cron.schedule("0 * * * *", async () => {
      try {
        await sendAdminNotification(
          "Scheduler: Hourly Digest Started",
          `Hourly digest started at ${new Date().toISOString()}`
        );

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Get all users
        const users = await User.find({});

        for (const user of users) {
          // Get changes for this user's competitors in the last hour
          const userCompetitors = await Competitor.find({ userId: user._id });
          const competitorIds = userCompetitors.map((c) => c._id);

          const changes = await Change.find({
            competitorId: { $in: competitorIds },
            detectedAt: { $gte: oneHourAgo },
          }).populate("competitor");

          if (changes.length > 0) {
            await sendWeeklyDigest(changes, user.email);
            console.log(
              `Sent hourly digest to ${user.email} with ${changes.length} changes`
            );
          }
        }

        await sendAdminNotification(
          "Scheduler: Hourly Digest Completed",
          `Hourly digest completed at ${new Date().toISOString()}`
        );
      } catch (err) {
        await sendAdminNotification(
          "Scheduler: Hourly Digest Error",
          `Error: ${err.message || err}`
        );
      }
    });
    isSchedulerRunning = true;
    console.log(
      "Scheduler started. Scraper will run every day at 8am, buzz updates every hour, and hourly email digests."
    );
  });
  return true;
}

function stopScheduler() {
  if (!isSchedulerRunning) return false;
  if (scraperTask) scraperTask.stop();
  if (buzzTask) buzzTask.stop();
  if (hourlyDigestTask) hourlyDigestTask.stop();
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
