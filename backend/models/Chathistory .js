const mongoose = require("mongoose");

// 🔖 SCAFFOLDED — Chat routes/controllers will be wired in a future task.
// Schema is complete and ready; no changes needed when you plug in the LLM.

const messageSchema = new mongoose.Schema(
  {
    role:      { type: String, enum: ["user", "assistant"], required: true },
    content:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatHistorySchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true },
    resumeId:     { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true },

    // Auto-title from resume filename or upload date — set at session creation
    sessionTitle: { type: String, default: "Resume Chat" },

    messages:     { type: [messageSchema], default: [] },
  },
  { timestamps: true }
);

// Fast lookup: all chat sessions for a user, newest first
chatHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("ChatHistory", chatHistorySchema);