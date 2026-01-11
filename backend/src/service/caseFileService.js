// services/CaseFileService.js
const path = require("path")
const CaseFile = require("../model/caseFile")
const CaseEvent = require("../model/caseEvent")
const { generatePdf } = require("../pdf/generatePdf")

/**
 * Issues a FINAL CaseFile (immutable, court-safe)
 */
async function createCaseFile(caseId, caseFileNumber, pages, issuedBy) {
  if (!caseId) throw new Error("caseId is required")
  if (!caseFileNumber) throw new Error("caseFileNumber is required")
  if (!issuedBy) throw new Error("issuedBy is required")

  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error("At least one page is required to issue CaseFile")
  }

  const existing = await CaseFile.findOne({ caseFileNumber })
  if (existing) {
    throw new Error("CaseFile already exists with this number")
  }

  // Generate FINAL (ISSUED) PDF
  const outputPath = path.join(
    "storage",
    "casefiles",
    `${caseFileNumber}.pdf`
  )
  const normalizedPages = pages.map(p => ({
    type: p.type,
    templateVersion: p.version, // 👈 FIX
    data: p.data
  }))
  

  const pdfResult = await generatePdf({
    pages: normalizedPages.map(p => ({
      type: p.type,
      version: p.templateVersion,
      data: p.data
    })),
    outputPath,
    mode: "ISSUED"
  })
  

  // Create immutable CaseFile DB record
  const caseFile = await CaseFile.create({
    caseId,
    caseFileNumber,
    pages: normalizedPages,
    pdf: {
      path: pdfResult.path,
      hash: pdfResult.hash
    },
    issuedAt: new Date(),
    issuedBy
  })
  

  // Log event (append-only)
  await CaseEvent.create({
    caseId,
    eventType: "CASEFILE_ISSUED",
    referenceId: caseFile._id,
    performedBy: issuedBy
  })

  return caseFile
}

module.exports = {
  createCaseFile
}