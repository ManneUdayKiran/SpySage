require("dotenv").config();
const mongoose = require("mongoose");
const { runAllScrapers } = require("./services/scraperRunner");
const Competitor = require("./models/Competitor");

async function insertStaticCompetitors() {
  // First, find an admin user or create a system user for static competitors
  const User = require("./models/User");
  let systemUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

  if (!systemUser) {
    // Create a system user for static competitors if admin doesn't exist
    const bcrypt = require("bcryptjs");
    systemUser = await User.create({
      name: "System",
      email: process.env.ADMIN_EMAIL || "system@spysage.com",
      password: await bcrypt.hash("system123", 10),
    });
    console.log("Created system user for static competitors");
  }

  const staticCompetitors = [
    {
      name: "Notion",
      website: "https://www.notion.so/",
      changelogUrl: "https://www.notion.so/releases",
      socialLinks: ["https://twitter.com/NotionHQ"],
      tags: ["productivity", "docs"],
      user: systemUser._id, // Add user reference
    },
    {
      name: "Airtable",
      website: "https://airtable.com/",
      changelogUrl: "https://community.airtable.com/c/product-updates/6",
      socialLinks: ["https://twitter.com/airtable"],
      tags: ["database", "collaboration"],
      user: systemUser._id, // Add user reference
    },
    {
      name: "ClickUp",
      website: "https://clickup.com/",
      changelogUrl: "https://clickup.com/blog/product-updates/",
      socialLinks: ["https://twitter.com/ClickUp"],
      tags: ["project management"],
      user: systemUser._id, // Add user reference
    },
  ];

  for (const comp of staticCompetitors) {
    const exists = await Competitor.findOne({ name: comp.name });
    if (!exists) {
      await Competitor.create(comp);
      console.log(`Inserted competitor: ${comp.name}`);
    } else {
      // Update existing competitor to have a user if it doesn't have one
      if (!exists.user) {
        exists.user = systemUser._id;
        await exists.save();
        console.log(`Updated competitor ${comp.name} with user reference`);
      }
    }
  }
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  await insertStaticCompetitors();
  await runAllScrapers();
  await mongoose.disconnect();
  process.exit(0);
}

main();
