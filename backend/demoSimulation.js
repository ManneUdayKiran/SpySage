require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Competitor = require("./models/Competitor");
const Change = require("./models/Change");
const Snapshot = require("./models/Snapshot");
const cron = require("node-cron");

async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for demo simulation");
}

async function simulateRealTimeChange() {
  try {
    const demoUser = await User.findOne({ email: "demo@spysage.com" });
    if (!demoUser) {
      console.log("Demo user not found. Please run createDemoData.js first.");
      return;
    }

    const competitors = await Competitor.find({
      user: demoUser._id,
    });
    if (competitors.length === 0) {
      console.log("No active competitors found for demo user.");
      return;
    }

    // Pick a random competitor
    const randomCompetitor =
      competitors[Math.floor(Math.random() * competitors.length)];

    const simulatedChanges = [
      {
        title: "New Feature Announcement",
        description: `${randomCompetitor.name} just announced a new feature that could impact market positioning.`,
        changeType: "Feature Addition",
        severity: "medium",
        tags: ["feature", "announcement", "live"],
      },
      {
        title: "Pricing Model Update",
        description: `${randomCompetitor.name} updated their pricing structure with new competitive rates.`,
        changeType: "Pricing Update",
        severity: "high",
        tags: ["pricing", "competitive", "live"],
      },
      {
        title: "Blog Post Published",
        description: `${randomCompetitor.name} published a new blog post about industry trends.`,
        changeType: "Blog Post",
        severity: "low",
        tags: ["blog", "content", "trends", "live"],
      },
      {
        title: "Homepage Redesign",
        description: `${randomCompetitor.name} launched a fresh homepage design with improved user experience.`,
        changeType: "UI/UX Changes",
        severity: "medium",
        tags: ["design", "homepage", "ux", "live"],
      },
      {
        title: "API Documentation Update",
        description: `${randomCompetitor.name} updated their API documentation with new endpoints and examples.`,
        changeType: "Documentation Update",
        severity: "low",
        tags: ["api", "docs", "developers", "live"],
      },
    ];

    const randomChange =
      simulatedChanges[Math.floor(Math.random() * simulatedChanges.length)];

    // Create snapshot
    const snapshot = new Snapshot({
      competitor: randomCompetitor._id,
      url: randomCompetitor.website,
      content: `Live demo content - ${randomChange.title}`,
      screenshot: null,
      createdAt: new Date(),
      user: demoUser._id,
    });
    await snapshot.save();

    // Create change
    const change = new Change({
      competitor: randomCompetitor._id,
      title: randomChange.title,
      description: randomChange.description,
      changeType: randomChange.changeType,
      severity: randomChange.severity,
      beforeSnapshot: snapshot._id,
      afterSnapshot: snapshot._id,
      detectedAt: new Date(),
      tags: randomChange.tags,
      user: demoUser._id,
      buzzScore: Math.floor(Math.random() * 80) + 20,
      sentimentScore: (Math.random() * 1.5 - 0.5).toFixed(2),
      isProcessed: true,
    });

    await change.save();

    console.log(
      `🔴 LIVE: Simulated change for ${randomCompetitor.name}: ${randomChange.title}`
    );
    console.log(
      `📊 Severity: ${randomChange.severity} | Type: ${randomChange.changeType}`
    );
    console.log(`🕐 Time: ${new Date().toISOString()}`);
    console.log("─────────────────────────────────────────────────────");
  } catch (error) {
    console.error("Error simulating real-time change:", error);
  }
}

async function startDemoSimulation() {
  try {
    await connectDB();

    console.log("🎬 SpySage Demo Simulation Started!");
    console.log(
      "📡 Simulating real-time competitor changes every 2-5 minutes..."
    );
    console.log("─────────────────────────────────────────────────────");

    // Simulate changes every 2-5 minutes for demo
    const intervals = [
      "*/2 * * * *",
      "*/3 * * * *",
      "*/4 * * * *",
      "*/5 * * * *",
    ];
    const randomInterval =
      intervals[Math.floor(Math.random() * intervals.length)];

    cron.schedule(randomInterval, async () => {
      await simulateRealTimeChange();
    });

    // Also create one immediate change
    setTimeout(async () => {
      await simulateRealTimeChange();
    }, 5000);

    console.log("✅ Demo simulation is running...");
    console.log("💡 Login to your SpySage dashboard to see live changes!");
    console.log("🔑 Demo credentials: demo@spysage.com / demo123");
  } catch (error) {
    console.error("Error starting demo simulation:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Stopping demo simulation...");
  await mongoose.connection.close();
  console.log("👋 Demo simulation stopped.");
  process.exit(0);
});

// Start the simulation
startDemoSimulation();
