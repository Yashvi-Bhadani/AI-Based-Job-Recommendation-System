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
    let top5Jobs  = [];   // from recommender: nearest + highest scored
    let allJobs   = [];   // all 30 sorted jobs
    try {
      const recommendResponse = await axios.post(
        "http://127.0.0.1:8000/recommend",
        { parsed_resume: parsedData },           // new signature — no page params
        { headers: { "Content-Type": "application/json" }, timeout: 90000 }
      );
      top5Jobs = recommendResponse.data?.top5     || [];
      allJobs  = recommendResponse.data?.all_jobs || [];
      console.log(`Recommender → top5: ${top5Jobs.length}, all: ${allJobs.length}`);
    } catch (recErr) {
      console.error("Recommender error:", recErr.message);
      // Non-critical — continue and return parsed data without jobs
    }

    // ── STEP 4: Save top 15 jobs to DB (dedup-safe) ───────────────────────────
    // all_jobs is already sorted local→country→global, take first 15
    const toSave     = allJobs.slice(0, 15);
    const savedJobDocs = [];

    for (const j of toSave) {
      try {
        // recommender already splits location — use it directly
        const { city, state, country } = parseLocation(j.location || "");

        const jobDoc = await Job.findOneAndUpdate(
          { title: j.job_title, company: j.company, url: j.url || "" },
          {
            $set: {
              title:      j.job_title,
              company:    j.company,
              url:        j.url         || "",
              location:   j.location    || "",
              city:       city          || j.state_code  || "",
              state:      state         || "",
              country:    country       || j.country     || "",
              isRemote:   j.remote      || false,
              isHybrid:   j.hybrid      || false,
              seniority:  j.seniority   || "",
              salary:     j.salary      || "",
              skills:     j.matched_skills || [],
              datePosted: j.date_posted  || "",
              status:     "Active",
            },
          },
          { upsert: true, new: true }
        );

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
    // Use recommender's top5 (already location-priority sorted), map to saved _ids
    const savedMap = new Map(
      savedJobDocs.map(({ jobDoc, matchScore, matchedSkills }) => [
        `${jobDoc.title}__${jobDoc.company}`,
        { jobDoc, matchScore, matchedSkills }
      ])
    );

    const top5 = top5Jobs.slice(0, 5).map((j) => {
      const saved = savedMap.get(`${j.job_title}__${j.company}`);
      if (saved) {
        return {
          _id:           saved.jobDoc._id,
          title:         saved.jobDoc.title,
          company:       saved.jobDoc.company,
          location:      saved.jobDoc.location,
          city:          saved.jobDoc.city,
          state:         saved.jobDoc.state,
          country:       saved.jobDoc.country,
          isRemote:      saved.jobDoc.isRemote,
          isHybrid:      saved.jobDoc.isHybrid,
          seniority:     saved.jobDoc.seniority,
          salary:        saved.jobDoc.salary,
          skills:        saved.jobDoc.skills,
          url:           saved.jobDoc.url,
          datePosted:    saved.jobDoc.datePosted,
          matchScore:    saved.matchScore,
          matchedSkills: saved.matchedSkills,
        };
      }
      // Fallback: job wasn't in top 15 saved — return raw recommender data
      return {
        title:         j.job_title,
        company:       j.company,
        location:      j.location,
        isRemote:      j.remote,
        isHybrid:      j.hybrid,
        seniority:     j.seniority,
        salary:        j.salary,
        url:           j.url,
        datePosted:    j.date_posted,
        matchScore:    j.match_score,
        matchedSkills: j.matched_skills,
      };
    });

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