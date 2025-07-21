const express = require("express");
const Change = require("../models/Change");
const Competitor = require("../models/Competitor");
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

// Get all changes for the authenticated user's competitors
router.get("/", async (req, res) => {
  try {
    // Find all competitors belonging to the user
    const userCompetitors = await Competitor.find({ user: req.user.userId });
    const competitorIds = userCompetitors.map((comp) => comp._id);

    // Find all changes for those competitors
    const changes = await Change.find({
      competitor: { $in: competitorIds },
    }).populate("competitor");
    res.json(changes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get change by ID (verify it belongs to the user's competitor)
router.get("/:id", async (req, res) => {
  try {
    const change = await Change.findById(req.params.id).populate("competitor");
    if (!change) return res.status(404).json({ error: "Not found" });

    // Verify the change belongs to the user's competitor
    const competitor = await Competitor.findById(change.competitor._id);
    if (!competitor || competitor.user.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this change" });
    }

    res.json(change);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get changes by competitor ID (verify competitor belongs to user)
router.get("/competitor/:competitorId", async (req, res) => {
  try {
    // Verify the competitor belongs to the user
    const competitor = await Competitor.findById(req.params.competitorId);
    if (!competitor || competitor.user.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this competitor" });
    }

    const changes = await Change.find({
      competitor: req.params.competitorId,
    }).populate("competitor");
    res.json(changes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create change (ensure it's for a competitor that belongs to the user)
router.post("/", async (req, res) => {
  try {
    // Verify the competitor belongs to the user
    const competitor = await Competitor.findById(req.body.competitor);
    if (!competitor || competitor.user.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({
          error: "Not authorized to create changes for this competitor",
        });
    }

    const change = new Change(req.body);
    await change.save();
    res.status(201).json(change);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
