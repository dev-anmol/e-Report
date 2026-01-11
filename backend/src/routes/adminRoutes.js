const express = require("express")
const router = express.Router()

const {
  getPendingForms,
  approveForm,
  rejectForm,
  issueForm,
  getSubmittedForms,
  getFormForAdmin
} = require("../controller/adminFormController")

const auth = require("../middleware/authMiddleware")
const requireRole = require("../middleware/roleMiddleware")
const generate = require("../controller/generatePdfController");

router.use(auth)
// router.use(requireRole("ADMIN"))

router.get("/admin/forms/pending", getPendingForms)
router.post("/admin/forms/:formId/approve", approveForm)
router.post("/admin/forms/:formId/reject", rejectForm)
router.post("/admin/forms/:formId/issue", issueForm)

router.get("/admin/forms/submitted", getSubmittedForms)
router.get("/admin/forms/:formId", getFormForAdmin)
router.post("/api/casefiles/issue", generate.generatePdfController)

module.exports = router