// const express = require("express");
// const fs = require("fs");
// const path = require("path");
// const { protect } = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploadMiddleware");
// const Resume = require("../models/Resume");

// const router = express.Router();

// const ensureUploadsDir = () => {
//   const dir = path.join(__dirname, "..", "uploads");
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir);
//   }
// };

// router.post(
//   "/upload",
//   protect,
//   (req, res, next) => {
//     ensureUploadsDir();
//     next();
//   },
//   upload.single("resume"),
//   async (req, res, next) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({ message: "No file provided" });
//       }

//       const resume = await Resume.create({
//         userId: req.user.id,
//         fileName: req.file.filename,
//         filePath: req.file.path,
//         originalName: req.file.originalname,
//         status: "Active",
//       });

//       res.status(201).json({
//         message: "Resume uploaded successfully",
//         resume,
//       });
//     } catch (err) {
//       next(err);
//     }
//   }
// );

// router.get("/my", protect, async (req, res, next) => {
//   try {
//     const resumes = await Resume.find({ userId: req.user.id }).sort({
//       createdAt: -1,
//     });
//     res.json(resumes);
//   } catch (err) {
//     next(err);
//   }
// });  

// module.exports = router;

const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {upload }= require("../middleware/uploadMiddleware");
const { uploadResume, getMyResumes, deleteResumeHistory, deleteAllResumeHistory } = require("../controllers/resumeController");

const router = express.Router();

// Upload Resume
router.post(
  "/upload",
  protect,
  upload.single("resume"),
  uploadResume
);

// Get My Resumes
router.get("/my", protect, getMyResumes);

// Delete one resume session and its user jobs
router.delete("/:resumeId/history", protect, deleteResumeHistory);

// Delete all resume sessions and user jobs for current user
router.delete("/history", protect, deleteAllResumeHistory);

module.exports = router;













// const express = require("express");
// const { upload } = require("../middleware/uploadMiddleware");
// const { uploadResume } = require("../controllers/resumeController");

// const router = express.Router();

// router.post("/upload", upload.single("file"), uploadResume);

// module.exports = router;
// >>>>>>> AI
