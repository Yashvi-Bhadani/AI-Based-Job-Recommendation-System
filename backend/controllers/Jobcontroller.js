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
    const { resumeId, groupBy = "country" } = req.query;

    const filter = { userId: req.user.id };
    if (resumeId) filter.resumeId = resumeId;

    // Fetch UserJob records and populate full Job data
    const userJobs = await UserJob.find(filter)
      .populate("jobId")
      .populate("resumeId", "originalName createdAt")
      .sort({ matchScore: -1 });

    // Flatten into a clean array
    const jobs = userJobs
      .filter((uj) => uj.jobId) // guard against orphaned references
      .map((uj) => ({
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
        resumeId:      uj.resumeId?._id,
        resumeName:    uj.resumeId?.originalName,
        uploadedAt:    uj.resumeId?.createdAt,
        userJobId:     uj._id,
      }));

    // Group by the requested location level
    const validGroupKeys = ["city", "state", "country"];
    const key = validGroupKeys.includes(groupBy) ? groupBy : "country";

    const grouped = {};
    for (const job of jobs) {
      const groupLabel = job[key] || (job.isRemote ? "Remote" : "Unknown");
      if (!grouped[groupLabel]) grouped[groupLabel] = [];
      grouped[groupLabel].push(job);
    }

    // Sort groups alphabetically, Remote last
    const sortedGroups = Object.entries(grouped)
      .sort(([a], [b]) => {
        if (a === "Remote") return 1;
        if (b === "Remote") return -1;
        return a.localeCompare(b);
      })
      .map(([label, items]) => ({ label, count: items.length, jobs: items }));

    return res.json({
      total:   jobs.length,
      groupBy: key,
      groups:  sortedGroups,
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