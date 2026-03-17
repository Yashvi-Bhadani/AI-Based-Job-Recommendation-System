const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const Application = require("../models/Application");

const router = express.Router();

// User applies to a job
router.post("/:jobId", protect, async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const existing = await Application.findOne({
      userId: req.user.id,
      jobId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already applied to this job" });
    }

    const application = await Application.create({
      userId: req.user.id,
      jobId,
      status: "Applied",
    });

    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
});

// Get logged-in user's applications
router.get("/my", protect, async (req, res, next) => {
  try {
    const apps = await Application.find({ userId: req.user.id })
      .populate("jobId")
      .sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    next(err);
  }
});

// Admin: get all applicants for a job
router.get("/job/:jobId", protect, adminOnly, async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const apps = await Application.find({ jobId })
      .populate("userId", "name email")
      .sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    next(err);
  }
});

// Admin: update application status
router.patch("/:id/status", protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const app = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(app);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

