require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Competitor = require("./models/Competitor");
const Change = require("./models/Change");
const Snapshot = require("./models/Snapshot");
const bcrypt = require("bcrypt");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

async function createDemoUser() {
  try {
    // Check if demo user already exists
    let demoUser = await User.findOne({ email: "demo@spysage.com" });

    if (!demoUser) {
      const hashedPassword = await bcrypt.hash("demo123", 10);
      demoUser = new User({
        username: "Demo User",
        email: "demo@spysage.com",
        password: hashedPassword,
      });
      await demoUser.save();
      console.log("✅ Demo user created: demo@spysage.com / demo123");
    } else {
      console.log("✅ Demo user already exists");
    }

    return demoUser._id;
  } catch (error) {
    console.error("Error creating demo user:", error);
    throw error;
  }
}

async function createDemoCompetitors(userId) {
  const competitors = [
    {
      name: "OpenAI",
      website: "https://openai.com",
      changelogUrl: "https://openai.com/blog",
      socialLinks: ["https://twitter.com/openai"],
      tags: ["ai", "gpt", "llm", "chatgpt"],
      buzz: 95,
      user: userId,
    },
    {
      name: "Anthropic",
      website: "https://anthropic.com",
      changelogUrl: "https://anthropic.com/news",
      socialLinks: ["https://twitter.com/anthropicai"],
      tags: ["ai", "claude", "safety", "llm"],
      buzz: 87,
      user: userId,
    },
    {
      name: "Google AI",
      website: "https://ai.google",
      changelogUrl: "https://ai.googleblog.com",
      socialLinks: ["https://twitter.com/googleai"],
      tags: ["ai", "google", "bard", "gemini"],
      buzz: 92,
      user: userId,
    },
    {
      name: "Microsoft AI",
      website: "https://www.microsoft.com/en-us/ai",
      changelogUrl: "https://blogs.microsoft.com/ai",
      socialLinks: ["https://twitter.com/MSFTResearch"],
      tags: ["ai", "microsoft", "copilot", "azure"],
      buzz: 88,
      user: userId,
    },
    {
      name: "Hugging Face",
      website: "https://huggingface.co",
      changelogUrl: "https://huggingface.co/blog",
      socialLinks: ["https://twitter.com/huggingface"],
      tags: ["ai", "ml", "models", "community"],
      buzz: 78,
      user: userId,
    },
    {
      name: "Cohere",
      website: "https://cohere.ai",
      changelogUrl: "https://cohere.ai/blog",
      socialLinks: ["https://twitter.com/cohere"],
      tags: ["ai", "enterprise", "nlp", "cohere"],
      buzz: 65,
      user: userId,
    },
  ];

  const createdCompetitors = [];

  for (const compData of competitors) {
    try {
      // Check if competitor already exists
      let competitor = await Competitor.findOne({
        website: compData.website,
        user: userId,
      });

      if (!competitor) {
        competitor = new Competitor(compData);
        await competitor.save();
        console.log(`✅ Created competitor: ${compData.name}`);
      } else {
        console.log(`✅ Competitor already exists: ${compData.name}`);
      }

      createdCompetitors.push(competitor);
    } catch (error) {
      console.error(`Error creating competitor ${compData.name}:`, error);
    }
  }

  return createdCompetitors;
}

async function createDemoChanges(competitors) {
  const changeTypes = [
    "New Product Launch",
    "Pricing Update",
    "Feature Addition",
    "UI/UX Changes",
    "Blog Post",
    "Documentation Update",
    "API Changes",
    "Security Update",
  ];

  const sampleChanges = [
    {
      title: "OpenAI GPT-4 Turbo Launch",
      description:
        "OpenAI announced the launch of GPT-4 Turbo with improved performance and reduced costs. The new model offers better instruction following and supports a 128K context window.",
      changeType: "New Product Launch",
      severity: "high",
      tags: ["product", "ai", "gpt-4", "launch"],
    },
    {
      title: "Anthropic Claude 3 Pricing Changes",
      description:
        "Anthropic updated their pricing structure for Claude 3, introducing new tier pricing with better value for high-volume users.",
      changeType: "Pricing Update",
      severity: "medium",
      tags: ["pricing", "claude", "subscription"],
    },
    {
      title: "Google AI Studio New Interface",
      description:
        "Google AI Studio received a major interface update with improved workflow management and better model comparison tools.",
      changeType: "UI/UX Changes",
      severity: "low",
      tags: ["ui", "ux", "studio", "interface"],
    },
    {
      title: "Microsoft Copilot Enterprise Features",
      description:
        "Microsoft announced new enterprise features for Copilot including advanced security controls and custom model training capabilities.",
      changeType: "Feature Addition",
      severity: "high",
      tags: ["enterprise", "copilot", "security", "features"],
    },
    {
      title: "Hugging Face Model Hub Update",
      description:
        "Hugging Face updated their model hub with new filtering options and improved search functionality for finding the right models.",
      changeType: "Feature Addition",
      severity: "medium",
      tags: ["models", "search", "hub", "update"],
    },
    {
      title: "Cohere API Documentation Refresh",
      description:
        "Cohere completely refreshed their API documentation with interactive examples and better code snippets for developers.",
      changeType: "Documentation Update",
      severity: "low",
      tags: ["api", "docs", "developers", "examples"],
    },
  ];

  const changes = [];

  for (let i = 0; i < competitors.length && i < sampleChanges.length; i++) {
    const competitor = competitors[i];
    const changeData = sampleChanges[i];

    try {
      // Create a snapshot first
      const snapshot = new Snapshot({
        competitor: competitor._id,
        url: competitor.website,
        content: `Demo content for ${competitor.name} - ${changeData.title}`,
        screenshot: null, // In real scenario, this would be a file path
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ), // Random time in last 7 days
        user: competitor.user,
      });
      await snapshot.save();

      // Create the change
      const change = new Change({
        competitor: competitor._id,
        title: changeData.title,
        description: changeData.description,
        changeType: changeData.changeType,
        severity: changeData.severity,
        beforeSnapshot: snapshot._id,
        afterSnapshot: snapshot._id, // In real scenario, these would be different
        detectedAt: new Date(
          Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000
        ), // Random time in last 5 days
        tags: changeData.tags,
        user: competitor.user,
        buzzScore: Math.floor(Math.random() * 100) + 1,
        sentimentScore: (Math.random() * 2 - 1).toFixed(2), // Random between -1 and 1
        isProcessed: true,
      });

      await change.save();
      changes.push(change);
      console.log(`✅ Created change: ${changeData.title}`);
    } catch (error) {
      console.error(`Error creating change for ${competitor.name}:`, error);
    }
  }

  return changes;
}

async function createAdditionalRecentChanges(competitors) {
  // Create some very recent changes to show real-time activity
  const recentChanges = [
    {
      title: "Homepage Banner Update",
      description: "Updated main banner with new marketing message",
      changeType: "UI/UX Changes",
      severity: "low",
    },
    {
      title: "API Rate Limit Changes",
      description: "Increased API rate limits for premium users",
      changeType: "API Changes",
      severity: "medium",
    },
    {
      title: "Security Patch Released",
      description: "Released security patch addressing minor vulnerabilities",
      changeType: "Security Update",
      severity: "high",
    },
  ];

  for (let i = 0; i < Math.min(3, competitors.length); i++) {
    const competitor = competitors[i];
    const changeData = recentChanges[i];

    try {
      const snapshot = new Snapshot({
        competitor: competitor._id,
        url: competitor.website,
        content: `Recent demo content for ${competitor.name}`,
        screenshot: null,
        createdAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Last 2 hours
        user: competitor.user,
      });
      await snapshot.save();

      const change = new Change({
        competitor: competitor._id,
        title: changeData.title,
        description: changeData.description,
        changeType: changeData.changeType,
        severity: changeData.severity,
        beforeSnapshot: snapshot._id,
        afterSnapshot: snapshot._id,
        detectedAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000), // Last hour
        tags: ["recent", "demo"],
        user: competitor.user,
        buzzScore: Math.floor(Math.random() * 50) + 25,
        sentimentScore: (Math.random() * 1).toFixed(2), // Positive sentiment
        isProcessed: true,
      });

      await change.save();
      console.log(`✅ Created recent change: ${changeData.title}`);
    } catch (error) {
      console.error(`Error creating recent change:`, error);
    }
  }
}

async function generateDemoStats() {
  const userId = await User.findOne({ email: "demo@spysage.com" });

  const stats = {
    totalCompetitors: await Competitor.countDocuments({ user: userId._id }),
    totalChanges: await Change.countDocuments({ user: userId._id }),
    recentChanges: await Change.countDocuments({
      user: userId._id,
      detectedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
    highSeverityChanges: await Change.countDocuments({
      user: userId._id,
      severity: "high",
    }),
  };

  console.log("\n📊 Demo Data Statistics:");
  console.log(`Total Competitors: ${stats.totalCompetitors}`);
  console.log(`Total Changes: ${stats.totalChanges}`);
  console.log(`Recent Changes (24h): ${stats.recentChanges}`);
  console.log(`High Severity Changes: ${stats.highSeverityChanges}`);
}

async function main() {
  try {
    await connectDB();

    console.log("🚀 Creating SpySage Demo Data...\n");

    // Create demo user
    const userId = await createDemoUser();

    // Create competitors
    const competitors = await createDemoCompetitors(userId);

    // Create historical changes
    await createDemoChanges(competitors);

    // Create recent changes for real-time demo
    await createAdditionalRecentChanges(competitors);

    // Show statistics
    await generateDemoStats();

    console.log("\n✅ Demo data creation completed!");
    console.log("\n🎯 Demo Login Credentials:");
    console.log("Email: demo@spysage.com");
    console.log("Password: demo123");
    console.log("\n🌟 Your SpySage demo environment is ready!");
  } catch (error) {
    console.error("Error creating demo data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed.");
    process.exit(0);
  }
}

// Run the script
main();
