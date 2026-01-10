const formService = require("../service/formService")
const Form = require("../model/form")

/**
 * GET /admin/forms/pending
 */
async function getPendingForms(req, res, next) {
  try {
    const forms = await formService.getPendingForms()
    res.status(200).json({ success: true, data: forms })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /admin/forms/:formId/approve
 */
async function approveForm(req, res, next) {
  try {
    const { formId } = req.params

    const form = await Form.findById(formId)
    if (!form) {
      return res.status(404).json({ message: "Form not found" })
    }

    if (form.status !== "SUBMITTED") {
      return res.status(400).json({ message: "Form not in submitted state" })
    }

    form.status = "APPROVED"
    form.approval = {
      approvedBy: req.user.id,
      approvedAt: new Date()
    }

    await form.save()

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /admin/forms/:formId/reject
 */
async function rejectForm(req, res, next) {
  try {
    const { formId } = req.params
    const { reason } = req.body

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason required" })
    }

    const form = await Form.findById(formId)
    if (!form) {
      return res.status(404).json({ message: "Form not found" })
    }

    if (form.status !== "SUBMITTED") {
      return res.status(400).json({ message: "Form not in submitted state" })
    }

    form.status = "REJECTED"
    form.approval = {
      approvedBy: req.user.id,
      approvedAt: new Date(),
      rejectionReason: reason
    }

    await form.save()

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /admin/forms/:id/issue
 */
async function issueForm(req, res, next) {
  try {
    const { formId } = req.params

    const form =formService.issueForm(formId, req.user.id)

    res.json({
      success: true,
      pdfPath: form.generatedPdfPath
    })
  } catch (err) {
    next(err)
  }
}

async function getSubmittedForms(req, res, next) {
  try {
    const forms = await Form.find({
      status: "SUBMITTED"
    })
      .sort({ createdAt: -1 })
      .populate("caseId", "branchCaseNumber sections")
      .populate("createdBy", "name")

    res.json({
      success: true,
      forms
    })
  } catch (err) {
    next(err)
  }
}

async function getFormForAdmin(req, res, next) {
  try {
    const { formId } = req.params

    const form = await Form.findById(formId)
      .populate("caseId", "branchCaseNumber sections")
      .populate("createdBy", "name role")

    if (!form) {
      return res.status(404).json({ message: "Form not found" })
    }

    res.json({
      success: true,
      form
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getPendingForms,
  approveForm,
  rejectForm,
  issueForm,
  getSubmittedForms,
  getFormForAdmin
}