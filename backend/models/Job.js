const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // Core identity — used for deduplication
    title:       { type: String, required: true },
    company:     { type: String, required: true },
    url:         { type: String, default: "" },

    // Location breakdown for filtering
    location:    { type: String, default: "" }, // raw string e.g. "San Francisco, CA, USA"
    city:        { type: String, default: "" },
    state:       { type: String, default: "" },
    country:     { type: String, default: "" },
    isRemote:    { type: Boolean, default: false },
    isHybrid:    { type: Boolean, default: false },

    // Job details
    seniority:   { type: String, default: "" }, // entry / mid / senior
    salary:      { type: String, default: "" },
    skills:      { type: [String], default: [] }, // technology_slugs from TheirStack
    description: { type: String, default: "" },
    datePosted:  { type: String, default: "" },

    status:      { type: String, default: "Active" },
  },
  { timestamps: true }
);

// Compound unique index — prevents duplicate jobs
jobSchema.index({ title: 1, company: 1, url: 1 }, { unique: true });

module.exports = mongoose.model("Job", jobSchema);