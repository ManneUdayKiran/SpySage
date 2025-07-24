require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use("/screenshots", express.static(path.join(__dirname, "screenshots")));

// Routes
const competitorRouter = require("./routes/competitor");
app.use("/api/competitors", competitorRouter);
const changeRouter = require("./routes/change");
app.use("/api/changes", changeRouter);
const userRouter = require("./routes/user");
app.use("/api/user", userRouter);
const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);
const healthRouter = require("./routes/health");
app.use("/api/health", healthRouter);
const manualScrapeRouter = require("./routes/manualScrape");
app.use("/api/manual-scrape", manualScrapeRouter);

// Health check route
app.get("/", (req, res) => {
  res.send("SpySage backend is running");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start server only after DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
