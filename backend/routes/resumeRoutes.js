
const express = require("express");
const { upload } = require("../middleware/uploadMiddleware");
const { uploadResume } = require("../controllers/resumeController");

const router = express.Router();
// router.post("/upload", (req, res) => {
//   console.log("CONTENT-TYPE:", req.headers["content-type"]);
//   res.json({ debug: "hit raw route" });
// });
router.post("/upload", upload.single("file"), uploadResume);

module.exports = router;
