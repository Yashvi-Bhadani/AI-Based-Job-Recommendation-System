// <<<<<<< HEAD
// const multer = require("multer");
// const path = require("path");

// const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// const storage = multer.diskStorage({
//   destination(req, file, cb) {
//     cb(null, path.join(__dirname, "..", "uploads"));
//   },
//   filename(req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
//     cb(null, `${base}-${Date.now()}${ext}`);
//   },
// });

// const allowedExts = [".pdf", ".doc", ".docx"];
// const allowedMimes = [
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
// ];

// const fileFilter = (req, file, cb) => {
//   const ext = path.extname(file.originalname).toLowerCase();
//   const mime = file.mimetype;

//   if (!allowedExts.includes(ext) || !allowedMimes.includes(mime)) {
//     return cb(new Error("Only PDF, DOC, DOCX files are allowed"));
//   }

//   cb(null, true);
// };

// const upload = multer({
//   storage,
//   limits: { fileSize: MAX_SIZE },
//   fileFilter,
// });

// module.exports = upload;

const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(process.cwd(), "uploads");

// Ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX allowed"));
  }
};


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { upload };

