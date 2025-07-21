require("dotenv").config();
const mongoose = require("mongoose");
const cron = require("node-cron");
const { runAllScrapers } = require("./services/scraperRunner");
const { sendWeeklyDigest } = require("./services/email");
const { sendAdminNotification } = require("./services/email");
const { updateAllCompetitorBuzz } = require("./services/scraperRunner");
const Change = require("./models/Change");

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
}

async function scheduledJob() {
  console.log(`[${new Date().toISOString()}] Running scheduled scraper job...`);
  await runAllScrapers();
}

connectDB().then(() => {
  // Run every day at 8am server time
  cron.schedule("0 8 * * *", async () => {
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
  console.log("Scheduler started. Scraper will run every day at 8am.");

  // Buzz update job: run every hour
  cron.schedule("0 * * * *", async () => {
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
});

// Weekly digest job: every Monday at 9am
cron.schedule("0 9 * * 1", async () => {
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
