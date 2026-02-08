const mongoose = require("mongoose")

const AIInsightSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CASE_SUMMARY", "DIGEST"],
      required: true,
      index: true
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    payload: {
      type: Object,
      required: true
    }
  },
  { timestamps: true }
)

AIInsightSchema.index({ type: 1, caseId: 1, userId: 1, createdAt: -1 })

module.exports = mongoose.model("AIInsight", AIInsightSchema)
