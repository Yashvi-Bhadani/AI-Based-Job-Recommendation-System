const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const Resume = require("../models/Resume"); // ✅ FIX 1

// Upload Resume
const uploadResume = async (req, res, next) => {
  try {
    console.log("FILE RECEIVED:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    // Send file to FastAPI
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(
      "http://127.0.0.1:8000/parse",
      formData,
      {
        headers: { ...formData.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    // ✅ FIX 2: Save in MongoDB
    const resume = await Resume.create({
      userId: req.user.id,
      fileName: req.file.filename,
      filePath: req.file.path,
      originalName: req.file.originalname,
      parsedData: response.data, // store parsed result
      status: "Active",
    });

    res.status(201).json({
      message: "Resume uploaded & parsed successfully",
      resume,
    });

  } catch (error) {
    console.error("FASTAPI ERROR:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};

// Get My Resumes
const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(resumes);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getMyResumes };