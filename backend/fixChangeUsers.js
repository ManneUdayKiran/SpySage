require("dotenv").config();
const mongoose = require("mongoose");
const Change = require("./models/Change");
const Competitor = require("./models/Competitor");

async function fixChangeUsers() {
  await mongoose.connect(process.env.MONGODB_URI);

  try {
    // Find changes without user field
    const changesWithoutUser = await Change.find({
      user: { $exists: false },
    }).populate("competitor");

    if (changesWithoutUser.length === 0) {
      console.log("All changes already have user references");
      return;
    }

    console.log(
      `Found ${changesWithoutUser.length} changes without user references`
    );

    let updatedCount = 0;

    // Update each change with the user from its competitor
    for (const change of changesWithoutUser) {
      if (change.competitor && change.competitor.user) {
        change.user = change.competitor.user;
        await change.save();
        updatedCount++;
      } else {
        console.log(
          `Warning: Change ${change._id} has competitor without user`
        );
      }
    }

    console.log(`Updated ${updatedCount} changes with user references`);
  } catch (error) {
    console.error("Error fixing change users:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixChangeUsers();
