const axios     = require("axios");
const FormData  = require("form-data");
const fs        = require("fs");

const Resume    = require("../models/Resume");
const Job       = require("../models/Job");
const UserJob   = require("../models/UserJob");
const { parseLocation } = require("../utils/locationParser");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/resume/upload
// 1. Send file to FastAPI /parse
// 2. Call FastAPI /recommend with parsed data
// 3. Save top 15 jobs to Job + UserJob collections (dedup-safe)
// 4. Return parsedData + top 5 jobs to frontend
// ─────────────────────────────────────────────────────────────────────────────
const uploadResume = async (req, res, next) => {
  try {
    console.log("FILE RECEIVED:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    // ── STEP 1: Parse resume via FastAPI ─────────────────────────────────────
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path), {
      filename:    req.file.originalname,
      contentType: req.file.mimetype,
    });

    const parseResponse = await axios.post(
      "http://127.0.0.1:8000/parse",
      formData,
      {
        headers: { ...formData.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength:    Infinity,
      }
    );

    const parsedData = parseResponse.data?.parsedData;
    if (!parsedData) {
      return res.status(500).json({ error: "Parsing failed — no parsedData returned" });
    }

    // ── STEP 2: Save resume record ────────────────────────────────────────────
    const resume = await Resume.create({
      userId:       req.user.id,
      fileName:     req.file.filename,
      filePath:     req.file.path,
      originalName: req.file.originalname,
      parsedData,
      status: "Active",
    });

    // ── STEP 3: Get job recommendations from FastAPI ──────────────────────────
    let rankedJobs = [];
    try {
      const recommendResponse = await axios.post(
        "http://127.0.0.1:8000/recommend",
        { parsed_resume: parsedData, page: 1, page_size: 15 },
        { headers: { "Content-Type": "application/json" }, timeout: 60000 }
      );
      rankedJobs = recommendResponse.data?.jobs || [];
      console.log(`Recommender returned ${rankedJobs.length} jobs`);
    } catch (recErr) {
      // Recommendations are non-critical — log and continue
      console.error("Recommender error:", recErr.message);
    }

    // ── STEP 4: Save top 15 jobs to DB (dedup-safe) ───────────────────────────
    const top15 = rankedJobs.slice(0, 15);
    const savedJobDocs = [];

    for (const j of top15) {
      try {
        const { city, state, country } = parseLocation(j.location || "");

        // upsert: if same title+company+url exists, update it; else insert
        const jobDoc = await Job.findOneAndUpdate(
          { title: j.job_title, company: j.company, url: j.url || "" },
          {
            $set: {
              title:      j.job_title,
              company:    j.company,
              url:        j.url        || "",
              location:   j.location   || "",
              city,
              state,
              country,
              isRemote:   j.remote     || false,
              isHybrid:   j.hybrid     || false,
              seniority:  j.seniority  || "",
              salary:     j.salary     || "",
              skills:     j.matched_skills || [],
              datePosted: j.date_posted || "",
              status:     "Active",
            },
          },
          { upsert: true, new: true }
        );

        // Junction record — one per user+job+resume
        await UserJob.findOneAndUpdate(
          { userId: req.user.id, jobId: jobDoc._id, resumeId: resume._id },
          {
            $set: {
              matchScore:    j.match_score    || 0,
              matchedSkills: j.matched_skills || [],
            },
          },
          { upsert: true }
        );

        savedJobDocs.push({ jobDoc, matchScore: j.match_score, matchedSkills: j.matched_skills });
      } catch (jobErr) {
        console.error("Job save error:", jobErr.message);
      }
    }

    // ── STEP 5: Build top 5 response ─────────────────────────────────────────
    const top5 = savedJobDocs.slice(0, 5).map(({ jobDoc, matchScore, matchedSkills }) => ({
      _id:           jobDoc._id,
      title:         jobDoc.title,
      company:       jobDoc.company,
      location:      jobDoc.location,
      city:          jobDoc.city,
      state:         jobDoc.state,
      country:       jobDoc.country,
      isRemote:      jobDoc.isRemote,
      isHybrid:      jobDoc.isHybrid,
      seniority:     jobDoc.seniority,
      salary:        jobDoc.salary,
      skills:        jobDoc.skills,
      url:           jobDoc.url,
      datePosted:    jobDoc.datePosted,
      matchScore,
      matchedSkills,
    }));

    // ── STEP 6: Respond ───────────────────────────────────────────────────────
    return res.status(201).json({
      message:    "Resume uploaded, parsed & jobs saved",
      resume:     { _id: resume._id, originalName: resume.originalName },
      parsedData,
      topJobs:    top5,        // shown immediately on UploadResume page
      totalSaved: savedJobDocs.length,
    });

  } catch (error) {
    console.error("uploadResume error:", error.response?.data || error.message);
    return res.status(500).json({ error: error.response?.data || error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/resume/my
// ─────────────────────────────────────────────────────────────────────────────
const getMyResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getMyResumes };