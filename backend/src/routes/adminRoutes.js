const express = require("express")
const router = express.Router()

const {
  getPendingForms,
  approveForm,
  rejectForm,
  getFormForAdmin,
  issueCaseFileController,
  getCaseFileByCaseId,
  previewFullCasePdfController
} = require("../controller/adminFormController")

const auth = require("../middleware/authMiddleware")
const requireRole = require("../middleware/roleMiddleware")
const { addRoznamaEntry } = require("../controller/roznamaController")

router.use(auth)
router.use(requireRole("ADMIN"))

router.get("/admin/forms/pending", getPendingForms)
router.get("/admin/forms/:formId", getFormForAdmin)
router.post("/admin/forms/:formId/approve", approveForm)
router.post("/admin/forms/:formId/reject", rejectForm)

router.post("/api/casefiles/issue", issueCaseFileController)
router.get("/cases/:caseId/casefile", getCaseFileByCaseId)
router.post("/cases/:caseId/roznama/entries", addRoznamaEntry)
router.post("/cases/:caseId/preview-pdf", previewFullCasePdfController)

module.exports = router