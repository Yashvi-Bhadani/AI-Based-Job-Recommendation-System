const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const uploadResume = async (req, res) => {
  try {
    console.log("FILE RECEIVED:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

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

    return res.json(response.data);
  } catch (error) {
    console.error("FASTAPI ERROR:", error.response?.data || error.message);
    return res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { uploadResume };