const caseFileService = require("../service/caseFileService")


async function generatePdfController(req, res) {
  try {
    const { caseId, pages, caseFileNumber } = req.body
    const issuedBy = "69600a4f90c1e232107e013e";
    const caseFile = await caseFileService.createCaseFile(caseId, caseFileNumber, pages, issuedBy);

    return res.status(201).json({
      success: true,
      caseFileId: caseFile._id,
      pdfPath: caseFile.pdf.path
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }
}


async function getPdfpages(){
    const getPdf = await generatePdf({
        outputPath: "storage/casefiles/CF-2026-0001.pdf",
        pages: [
          {
            type: "CASE_FORM",
            version: "v1",
            data: caseFormData
          },
          {
            type: "NOTICE_130",
            version: "v1",
            data: notice130Data
          }
        ]
      });      
}

module.exports = {
  generatePdfController
}