require("dotenv").config();
const mongoose = require("mongoose");
const Change = require("./models/Change");
const Competitor = require("./models/Competitor");
const User = require("./models/User");

async function fixOrphanedChanges() {
  await mongoose.connect(process.env.MONGODB_URI);

  try {
    // Find system user
    const systemUser = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (!systemUser) {
      console.log(
        "No system user found, please run fixCompetitorUsers.js first"
      );
      return;
    }

    // Find changes without user field
    const changesWithoutUser = await Change.find({ user: { $exists: false } });

    console.log(
      `Found ${changesWithoutUser.length} changes without user references`
    );

    let fixedCount = 0;
    let deletedCount = 0;

    for (const change of changesWithoutUser) {
      // Try to find the competitor
      const competitor = await Competitor.findById(change.competitor);

      if (competitor && competitor.user) {
        // Update change with competitor's user
        change.user = competitor.user;
        await change.save();
        fixedCount++;
      } else if (competitor && !competitor.user) {
        // Competitor exists but has no user, assign system user to both
        competitor.user = systemUser._id;
        await competitor.save();
        change.user = systemUser._id;
        await change.save();
        fixedCount++;
      } else {
        // Competitor doesn't exist, delete the orphaned change
        await Change.deleteOne({ _id: change._id });
        deletedCount++;
        console.log(`Deleted orphaned change ${change._id}`);
      }
    }

    console.log(`Fixed ${fixedCount} changes with user references`);
    console.log(`Deleted ${deletedCount} orphaned changes`);
  } catch (error) {
    console.error("Error fixing orphaned changes:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixOrphanedChanges();
