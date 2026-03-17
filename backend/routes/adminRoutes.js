const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Resume = require("../models/Resume");
const Job = require("../models/Job");
const Application = require("../models/Application");
const ActivityLog = require("../models/ActivityLog");

const router = express.Router();

// Get all users (no passwords)
router.get("/users", protect, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Toggle block/unblock user
router.patch("/users/:id/block", protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ id: user._id, isBlocked: user.isBlocked });
  } catch (err) {
    next(err);
  }
});

// Get all resumes
router.get("/resumes", protect, adminOnly, async (req, res, next) => {
  try {
    const resumes = await Resume.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    next(err);
  }
});

// Stats
router.get("/stats", protect, adminOnly, async (req, res, next) => {
  try {
    const [totalUsers, totalJobs, totalResumes, totalApplications] =
      await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
        Resume.countDocuments(),
        Application.countDocuments(),
      ]);

    res.json({
      totalUsers,
      totalJobs,
      totalResumes,
      totalApplications,
    });
  } catch (err) {
    next(err);
  }
});

// Activity Log
router.get("/activity", protect, adminOnly, async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

