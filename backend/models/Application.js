const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Reviewed", "Rejected", "Accepted"],
      default: "Applied",
    },
  },
  { timestamps: { createdAt: "appliedAt", updatedAt: "updatedAt" } }
);

module.exports = mongoose.model("Application", applicationSchema);

