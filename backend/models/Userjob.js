const mongoose = require("mongoose");

const userJobSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
    jobId:         { type: mongoose.Schema.Types.ObjectId, ref: "Job",    required: true },
    resumeId:      { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },

    matchScore:    { type: Number, default: 0 },       // 0–100
    matchedSkills: { type: [String], default: [] },    // overlapping skills

    isSaved:       { type: Boolean, default: false },  // bookmarked by user
    isApplied:     { type: Boolean, default: false },  // user clicked Apply
  },
  { timestamps: true }
);

// One record per user+job+resume combination
userJobSchema.index({ userId: 1, jobId: 1, resumeId: 1 }, { unique: true });

// Fast lookup: "all jobs for this user from this resume"
userJobSchema.index({ userId: 1, resumeId: 1 });

module.exports = mongoose.model("UserJob", userJobSchema);