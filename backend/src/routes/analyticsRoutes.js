const express = require("express")
const router = express.Router()

const auth = require("../middleware/authMiddleware")
const requireRole = require("../middleware/roleMiddleware")
const {
  getAnalyticsOverview,
  getAIDigest,
  getCaseSummary
} = require("../controller/analyticsController")

router.use(auth)

router.get("/analytics/overview", getAnalyticsOverview)
router.get("/analytics/ai-digest", requireRole("ADMIN"), getAIDigest)
router.get("/cases/:caseId/ai-summary", getCaseSummary)

module.exports = router
