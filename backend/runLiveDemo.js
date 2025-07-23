require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Competitor = require("./models/Competitor");
const Change = require("./models/Change");
const Snapshot = require("./models/Snapshot");
const { runCompetitorScraping } = require("./services/scraperRunner");

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
}

async function runLiveDemoScraping() {
  try {
    console.log("🕷️  Starting Live Demo Scraping...");

    const demoUser = await User.findOne({ email: "demo@spysage.com" });
    if (!demoUser) {
      console.log("❌ Demo user not found. Run createDemoData.js first.");
      return;
    }

    const competitors = await Competitor.find({
      user: demoUser._id,
    }).limit(3); // Limit to 3 for demo

    if (competitors.length === 0) {
      console.log("❌ No active competitors found.");
      return;
    }

    console.log(
      `🎯 Found ${competitors.length} competitors for live scraping:`
    );
    competitors.forEach((comp) => {
      console.log(`   - ${comp.name}: ${comp.website}`);
    });

    console.log("\n🚀 Starting scraping process...");

    for (const competitor of competitors) {
      try {
        console.log(`\n📡 Scraping ${competitor.name}...`);

        // Run the actual scraper
        await runCompetitorScraping(competitor);

        console.log(`✅ Completed scraping ${competitor.name}`);

        // Add a small delay between scraping
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error scraping ${competitor.name}:`, error.message);
      }
    }

    // Check for any new changes created
    const recentChanges = await Change.find({
      user: demoUser._id,
      detectedAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }, // Last 10 minutes
    }).populate("competitor");

    console.log(`\n📊 Demo Results:`);
    console.log(`🔍 Recent changes detected: ${recentChanges.length}`);

    if (recentChanges.length > 0) {
      console.log(`\n📋 Latest Changes:`);
      recentChanges.forEach((change, index) => {
        console.log(`${index + 1}. ${change.competitor.name}: ${change.title}`);
        console.log(
          `   Severity: ${change.severity} | Type: ${change.changeType}`
        );
        console.log(`   Time: ${change.detectedAt.toISOString()}`);
      });
    }

    console.log(`\n🎉 Live demo scraping completed!`);
    console.log(`💡 Login to SpySage dashboard to view all results.`);
  } catch (error) {
    console.error("Error in live demo scraping:", error);
  }
}

async function main() {
  try {
    await connectDB();
    await runLiveDemoScraping();
  } catch (error) {
    console.error("Demo script error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed.");
    process.exit(0);
  }
}

main();
