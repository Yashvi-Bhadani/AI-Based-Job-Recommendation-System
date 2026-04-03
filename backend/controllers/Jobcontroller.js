const Job     = require("../models/Job");
const UserJob = require("../models/UserJob");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/jobs/my?resumeId=xxx&groupBy=city|state|country
//
// Returns all jobs saved for the logged-in user (optionally filtered by resume).
// Groups them by location level for the Jobs page tabs.
// ─────────────────────────────────────────────────────────────────────────────
const getMyJobs = async (req, res, next) => {
  try {
    // We return jobs grouped by resume upload session (most recent first). For UI session boxes.
    const userJobs = await UserJob.find({ userId: req.user.id })
      .populate("jobId")
      .populate("resumeId", "originalName createdAt")
      .sort({ createdAt: -1 });

    const sessionMap = new Map();

    for (const uj of userJobs) {
      if (!uj.resumeId || !uj.jobId) continue;

      const key = uj.resumeId._id.toString();
      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          resumeId:   uj.resumeId._id,
          resumeName: uj.resumeId.originalName,
          uploadedAt: uj.resumeId.createdAt,
          jobs:       []
        });
      }

      sessionMap.get(key).jobs.push({
        _id:           uj.jobId._id,
        title:         uj.jobId.title,
        company:       uj.jobId.company,
        location:      uj.jobId.location,
        city:          uj.jobId.city,
        state:         uj.jobId.state,
        country:       uj.jobId.country,
        isRemote:      uj.jobId.isRemote,
        isHybrid:      uj.jobId.isHybrid,
        seniority:     uj.jobId.seniority,
        salary:        uj.jobId.salary,
        skills:        uj.jobId.skills,
        url:           uj.jobId.url,
        datePosted:    uj.jobId.datePosted,
        status:        uj.jobId.status,
        matchScore:    uj.matchScore,
        matchedSkills: uj.matchedSkills,
        isSaved:       uj.isSaved,
        isApplied:     uj.isApplied,
        userJobId:     uj._id,
      });
    }

    let sessions = Array.from(sessionMap.values())
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    if (sessions.length === 0 && userJobs.length > 0) {
      const legacyJobs = userJobs
        .filter((uj) => uj.jobId)
        .map((uj) => ({
          _id: uj.jobId._id,
          title: uj.jobId.title,
          company: uj.jobId.company,
          location: uj.jobId.location,
          city: uj.jobId.city,
          state: uj.jobId.state,
          country: uj.jobId.country,
          isRemote: uj.jobId.isRemote,
          isHybrid: uj.jobId.isHybrid,
          seniority: uj.jobId.seniority,
          salary: uj.jobId.salary,
          skills: uj.jobId.skills,
          url: uj.jobId.url,
          datePosted: uj.jobId.datePosted,
          status: uj.jobId.status,
          matchScore: uj.matchScore,
          matchedSkills: uj.matchedSkills,
          isSaved: uj.isSaved,
          isApplied: uj.isApplied,
          userJobId: uj._id,
        }));

      sessions = [{
        resumeId: null,
        resumeName: "Legacy Resume Jobs",
        uploadedAt: new Date(),
        jobs: legacyJobs,
      }];
    }

    sessions = sessions.slice(0, 5);
    const totalJobs = sessions.reduce((sum, s) => sum + s.jobs.length, 0);

    return res.json({
      total: totalJobs,
      sessions,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/jobs/:userJobId/save    — toggle bookmark
// PATCH /api/jobs/:userJobId/apply   — mark as applied
// ─────────────────────────────────────────────────────────────────────────────
const toggleSave = async (req, res, next) => {
  try {
    const uj = await UserJob.findOne({ _id: req.params.userJobId, userId: req.user.id });
    if (!uj) return res.status(404).json({ error: "Not found" });
    uj.isSaved = !uj.isSaved;
    await uj.save();
    res.json({ isSaved: uj.isSaved });
  } catch (err) {
    next(err);
  }
};

const markApplied = async (req, res, next) => {
  try {
    const uj = await UserJob.findOne({ _id: req.params.userJobId, userId: req.user.id });
    if (!uj) return res.status(404).json({ error: "Not found" });
    uj.isApplied = true;
    await uj.save();
    res.json({ isApplied: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyJobs, toggleSave, markApplied };