const caseFileService = require("../service/caseFileService")


const caseFileService = require("../service/caseFileService")

async function issueCaseFileController(req, res) {
  try {
    const { caseId, caseFileNumber } = req.body
    const issuedBy = req.user._id   // admin user

    const caseFile = await caseFileService.issueCaseFile({
      caseId,
      caseFileNumber,
      issuedBy
    })

    res.status(201).json({
      success: true,
      caseFileId: caseFile._id,
      pdfPath: caseFile.pdf.path
    })
  } catch (err) {
    console.error(err)
    res.status(400).json({ message: err.message })
  }
}

async function generatePdfforForm130(){

}


module.exports = {
  generatePdfController,
  issueCaseFileController
}