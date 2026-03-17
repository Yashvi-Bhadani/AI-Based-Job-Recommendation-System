const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/authMiddleware");
const Resume = require("../models/Resume");

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// POST /api/ai/match - analyze resume and get job recommendations
router.post("/match", protect, async (req, res, next) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: "resumeId is required" });
    }

    // get resume from DB
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // call Python AI service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/parse`, {
      filePath: resume.filePath,
    });

    res.json({
      resumeId,
      fileName: resume.originalName,
      parsedData: aiResponse.data.parsedData,
      recommendations: aiResponse.data.recommendations,
    });
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({ message: "AI service is not running. Start the Python server." });
    }
    next(err);
  }
});

// GET /api/ai/health - check if AI service is running
router.get("/health", protect, async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/`);
    res.json({ aiService: "online", detail: response.data });
  } catch {
    res.status(503).json({ aiService: "offline", message: "AI service is not running" });
  }
});

module.exports = router;
