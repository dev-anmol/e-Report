module.exports.render = function renderCaseForm(doc, data, text) {
    // HEADER
    doc
      .fontSize(14)
      .text(text.header.department, { align: "center" })
      .text(text.header.office, { align: "center" })
      .moveDown(2)
  
    // CASE INFO BLOCK
    doc.fontSize(11)
  
    labeledRow(doc, text.labels.branchCaseNo, data.caseNumbers.branchCaseNumber)
    labeledRow(doc, text.labels.policeCaseNo, data.caseNumbers.policeStationCaseNumber)
    labeledRow(doc, text.labels.sections, data.sections.join(", "))
    labeledRow(doc, text.labels.policeStation, data.policeStation.name)
    labeledRow(doc, text.labels.district, data.policeStation.district)
    labeledRow(doc, text.labels.registrationDate, formatDate(data.registrationDate))
  
    doc.moveDown(1.5)
  
    // PROCEEDINGS TABLE
    doc.fontSize(12).text(text.labels.proceedings)
    doc.moveDown(0.5)
  
    drawProceedingsTable(doc, data.proceedings)
  
    doc.moveDown(1)
  
    // REMARKS
    doc.fontSize(12).text(text.labels.remarks)
    doc.moveDown(0.5)
    doc.fontSize(11).text(data.remarks || "-", { minHeight: 40 })
  
    doc.moveDown(2)
  
    // FOOTER
    doc.text(`तयार करणारे: ${data.preparedBy.name}`)
    doc.text(data.preparedBy.designation)
  }