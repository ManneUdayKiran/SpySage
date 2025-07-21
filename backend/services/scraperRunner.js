const Competitor = require("../models/Competitor");
const Snapshot = require("../models/Snapshot");
const Change = require("../models/Change");
const { scrapeCompetitor } = require("./scraper");
const {
  summarizeTextWithGroq,
  categorizeChangeWithOpenRouter,
} = require("./groq");
const { addChangeToNotion } = require("./notion");
const { sendChangeToSlack } = require("./slack");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const { getBuzzCount } = require("./twitter");

// Simple diff: returns true if content changed
function isContentChanged(oldHtml, newHtml) {
  return oldHtml !== newHtml;
}

// Simple text diff: returns a string showing lines added/removed
function getTextDiff(oldText, newText) {
  const oldLines = (oldText || "").split("\n");
  const newLines = (newText || "").split("\n");
  const diff = [];
  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    if (oldLines[i] !== newLines[i]) {
      if (oldLines[i] && !newLines[i]) {
        diff.push(`- ${oldLines[i]}`);
      } else if (!oldLines[i] && newLines[i]) {
        diff.push(`+ ${newLines[i]}`);
      } else {
        if (oldLines[i]) diff.push(`- ${oldLines[i]}`);
        if (newLines[i]) diff.push(`+ ${newLines[i]}`);
      }
    }
  }
  return diff.join("\n");
}

async function takeScreenshot(url, filename) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  await page.setViewport({ width: 1280, height: 800 });
  const screenshotPath = path.join(__dirname, "..", "screenshots", filename);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();
  return screenshotPath;
}

async function runAllScrapers() {
  const competitors = await Competitor.find();
  for (const competitor of competitors) {
    const lastSnapshot = await Snapshot.findOne({
      competitor: competitor._id,
    }).sort({ createdAt: -1 });
    const { html, urlUsed } = await scrapeCompetitor(competitor);
    if (!html) continue;
    const changed = !lastSnapshot || isContentChanged(lastSnapshot.html, html);
    let beforeScreenshot = "";
    let afterScreenshot = "";
    if (changed) {
      // Take before screenshot if lastSnapshot exists
      if (lastSnapshot) {
        try {
          beforeScreenshot = await takeScreenshot(
            urlUsed,
            `${competitor._id}_before.png`
          );
        } catch (e) {
          beforeScreenshot = "";
        }
      }
      // Save new snapshot
      await Snapshot.create({ competitor: competitor._id, url: urlUsed, html });
      // Summarize the change
      let summary = await summarizeTextWithGroq(html);
      if (!summary) summary = "Summary not available.";
      // Categorize the change
      let category = "other";
      try {
        category = await categorizeChangeWithOpenRouter(summary);
      } catch (e) {
        category = "other";
      }
      // Take after screenshot
      try {
        afterScreenshot = await takeScreenshot(
          urlUsed,
          `${competitor._id}_after.png`
        );
      } catch (e) {
        afterScreenshot = "";
      }
      // Create a Change entry
      let diffText = "";
      if (lastSnapshot) {
        diffText = getTextDiff(lastSnapshot.html, html);
      }
      const newChange = await Change.create({
        competitor: competitor._id,
        user: competitor.user, // Add the user from the competitor
        type: "changelog",
        summary,
        details: "Content changed",
        url: urlUsed,
        detectedAt: new Date(),
        diff: { text: diffText },
        impact: "Unknown",
        tags: [],
        category,
        beforeScreenshot,
        afterScreenshot,
      });
      // Add to Notion (populate competitor name)
      await addChangeToNotion({
        ...newChange.toObject(),
        competitor: { name: competitor.name },
      });
      // Send to Slack
      await sendChangeToSlack({
        ...newChange.toObject(),
        competitor: { name: competitor.name },
      });
      console.log(`Change detected for ${competitor.name}`);
    }
  }
}

async function updateAllCompetitorBuzz() {
  const competitors = await Competitor.find();
  for (const competitor of competitors) {
    // Use competitor name as the keyword for buzz
    const buzz = await getBuzzCount(competitor.name);
    competitor.buzz = buzz;
    await competitor.save();
  }
}

module.exports = {
  runAllScrapers,
  updateAllCompetitorBuzz,
};
