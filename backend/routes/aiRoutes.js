const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/match", protect, (req, res) => {
  const { userId, jobId } = req.body;
  res.json({
    userId,
    jobId,
    matchScore: 0,
    message: "AI model not connected yet",
  });
});

module.exports = router;

