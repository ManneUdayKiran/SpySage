require("dotenv").config();
const mongoose = require("mongoose");
const Competitor = require("./models/Competitor");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

async function fixCompetitorUsers() {
  await mongoose.connect(process.env.MONGODB_URI);

  try {
    // Find competitors without user field
    const competitorsWithoutUser = await Competitor.find({
      user: { $exists: false },
    });

    if (competitorsWithoutUser.length === 0) {
      console.log("All competitors already have user references");
      return;
    }

    console.log(
      `Found ${competitorsWithoutUser.length} competitors without user references`
    );

    // Find or create a system user
    let systemUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (!systemUser) {
      systemUser = await User.create({
        name: "System Admin",
        email: process.env.ADMIN_EMAIL || "admin@spysage.com",
        password: await bcrypt.hash("admin123", 10),
      });
      console.log("Created system admin user");
    }

    // Update all competitors without users
    const result = await Competitor.updateMany(
      { user: { $exists: false } },
      { $set: { user: systemUser._id } }
    );

    console.log(
      `Updated ${result.modifiedCount} competitors with system user reference`
    );
  } catch (error) {
    console.error("Error fixing competitor users:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixCompetitorUsers();
