const express = require("express");
const Competitor = require("../models/Competitor");
const Change = require("../models/Change");
const { getBuzzCount } = require("../services/twitter");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = user;
      next();
    }
  );
};

// Apply authentication to all routes
router.use(authenticateToken);

// Trending competitors by buzz - MUST be before /:id route
router.get("/trending", async (req, res) => {
  try {
    const competitors = await Competitor.find({ user: req.user.userId })
      .sort({ buzz: -1 })
      .limit(5);
    res.json(competitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all competitors for the authenticated user
router.get("/", async (req, res) => {
  try {
    const competitors = await Competitor.find({ user: req.user.userId });
    res.json(competitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get competitor by ID (user-specific)
router.get("/:id", async (req, res) => {
  try {
    const competitor = await Competitor.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!competitor) return res.status(404).json({ error: "Not found" });
    res.json(competitor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create competitor (user-specific)
router.post("/", async (req, res) => {
  try {
    const competitor = new Competitor({
      ...req.body,
      user: req.user.userId,
    });
    await competitor.save();
    res.status(201).json(competitor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update competitor (user-specific)
router.put("/:id", async (req, res) => {
  try {
    const competitor = await Competitor.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    if (!competitor) return res.status(404).json({ error: "Not found" });
    res.json(competitor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete competitor (user-specific)
router.delete("/:id", async (req, res) => {
  try {
    const competitor = await Competitor.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });
    if (!competitor) return res.status(404).json({ error: "Not found" });
    // Cascade delete: remove all changes related to this competitor
    await Change.deleteMany({
      competitor: req.params.id,
      user: req.user.userId,
    });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
