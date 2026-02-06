const path = require("path")
const fs = require("fs")

const LOGO_PATH = path.resolve(
  __dirname,
  "../../../../assets/logos/MHlogo.png"
)

const TABLE_COLS = {
  date: 70,
  proceedings: 330,
  nextDate: 120
}

module.exports.render = function renderCaseRoznama(doc, data, text) {
  const PAGE_BOTTOM = doc.page.height - doc.page.margins.bottom
  const PAGE_WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const START_X = doc.x

  function drawLine(y) {
    doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke()
  }

  function drawVerticalLine(x, y1, y2) {
    doc.moveTo(x, y1).lineTo(x, y2).stroke()
  }

  /* =========================
     HEADER
     ========================= */
  function drawHeader() {
    // Top Logos
    try {
      doc.image(LOGO_PATH, (doc.page.width / 2) - 30, doc.y, { width: 60 })
    } catch (e) { }

    doc.moveDown(4)
    doc
      .fontSize(16)
      .font(doc.fonts.bold)
      .text(text.header.authority, { align: "center" })
      .text(text.header.officeLine, { align: "center" })

    doc.moveDown(1)

    // Case Info Table
    const tableTop = doc.y
    const col1Width = PAGE_WIDTH / 2

    doc.fontSize(10).font(doc.fonts.regular)

    // Borders for case info
    drawLine(tableTop)

    let currentY = tableTop + 5

    doc.text(`${text.caseInfoLabels.policeStation} - ${data.caseInfo.policeStation}`, doc.page.margins.left + 5, currentY)
    doc.text(`${text.caseInfoLabels.branchCaseNumber} - ${data.caseInfo.branchCaseNumber}`, doc.page.margins.left + col1Width + 5, currentY)

    currentY += 15
    drawLine(currentY)
    currentY += 5

    doc.text(`${text.caseInfoLabels.policeCaseNumber} - ${data.caseInfo.policeCaseNumber || "-"}`, doc.page.margins.left + 5, currentY)

    currentY += 15
    drawLine(currentY)
    currentY += 5

    doc.text(`${text.caseInfoLabels.complainant} - ${data.caseInfo.complainant?.name || "-"}`, doc.page.margins.left + 5, currentY)
    doc.text(`${text.caseInfoLabels.sections} - ${data.caseInfo.sections.join(", ")}`, doc.page.margins.left + col1Width + 5, currentY)

    currentY += 15
    drawLine(currentY)
    currentY += 5

    // Defendants Section
    doc.text(`${text.caseInfoLabels.defendants} -`, doc.page.margins.left + 5, currentY)

    let defendantY = currentY
    data.caseInfo.defendants.forEach((d, i) => {
      doc.text(`${i + 1}) ${d.name}`, doc.page.margins.left + 150, defendantY)
      defendantY += 12
    })

    // Vertical split for defendants (address on right)
    doc.text("सर्व रा. शेववस्ती", doc.page.margins.left + col1Width + 5, currentY + 10)
    doc.text("नगर कल्याण रोड, अहमदनगर", doc.page.margins.left + col1Width + 5, currentY + 22)

    const tableBottom = Math.max(defendantY, currentY + 35) + 5
    drawLine(tableBottom)

    // Vertical borders for header table
    drawVerticalLine(doc.page.margins.left, tableTop, tableBottom)
    drawVerticalLine(doc.page.margins.left + col1Width, tableTop, tableBottom)
    drawVerticalLine(doc.page.width - doc.page.margins.right, tableTop, tableBottom)

    doc.y = tableBottom + 10
  }

  /* =========================
     TABLE HEADER
     ========================= */
  function drawTableHeader() {
    const startY = doc.y
    doc.fontSize(11).font(doc.fonts.bold)

    drawLine(startY)

    let currentY = startY + 5
    doc.text(text.table.date, doc.page.margins.left + 5, currentY, { width: TABLE_COLS.date })
    doc.text(text.table.proceedings, doc.page.margins.left + TABLE_COLS.date + 5, currentY, { width: TABLE_COLS.proceedings, align: "center" })
    doc.text(text.table.nextDate, doc.page.margins.left + TABLE_COLS.date + TABLE_COLS.proceedings + 5, currentY, { width: TABLE_COLS.nextDate, align: "center" })

    currentY += 15
    drawLine(currentY)

    // Vertical borders for table header
    drawVerticalLine(doc.page.margins.left, startY, currentY)
    drawVerticalLine(doc.page.margins.left + TABLE_COLS.date, startY, currentY)
    drawVerticalLine(doc.page.margins.left + TABLE_COLS.date + TABLE_COLS.proceedings, startY, currentY)
    drawVerticalLine(doc.page.width - doc.page.margins.right, startY, currentY)

    doc.y = currentY
  }

  function ensureSpace(height) {
    if (doc.y + height > PAGE_BOTTOM) {
      doc.addPage()
      drawHeader()
      drawTableHeader()
    }
  }

  /* =========================
     TABLE ROW
     ========================= */
  function drawRow(entry, isLast) {
    const startY = doc.y
    doc.fontSize(10).font(doc.fonts.regular)

    const proceedingsHeight = doc.heightOfString(entry.proceedings, {
      width: TABLE_COLS.proceedings - 10
    })

    // Estimate signature height
    let sigHeight = 0
    if (entry.presentAccused?.some(p => p.signature)) {
      sigHeight = 60
    }

    const rowContentHeight = Math.max(proceedingsHeight, 40) + sigHeight
    const rowHeight = rowContentHeight + 20

    ensureSpace(rowHeight)

    const drawY = doc.y // Real Y after potential addPage

    doc.text(entry.date, doc.page.margins.left + 5, drawY + 10)

    doc.text(entry.proceedings, doc.page.margins.left + TABLE_COLS.date + 5, drawY + 10, {
      width: TABLE_COLS.proceedings - 10,
      align: "justify"
    })

    doc.text(entry.nextDate || "-", doc.page.margins.left + TABLE_COLS.date + TABLE_COLS.proceedings + 5, drawY + 10, {
      width: TABLE_COLS.nextDate - 10,
      align: "center"
    })

    // Signatures in the middle column
    if (entry.presentAccused && entry.presentAccused.length > 0) {
      let currentSigY = drawY + proceedingsHeight + 15
      entry.presentAccused.forEach(p => {
        if (p.signature) {
          try {
            const sigPath = path.resolve(process.cwd(), p.signature)
            if (fs.existsSync(sigPath)) {
              doc.image(sigPath, doc.page.width - doc.page.margins.right - 100, currentSigY, { height: 30 })
              doc.fontSize(8).text(p.name, doc.page.width - doc.page.margins.right - 100, currentSigY + 32)
              currentSigY += 45
            }
          } catch (e) { }
        }
      })
    }

    // Magistrate signature space at bottom of each row (as in image)
    doc.fontSize(9).font(doc.fonts.bold)
    doc.text("विशेष कार्यकारी दंडाधिकारी", doc.page.margins.left + TABLE_COLS.date + 100, drawY + rowHeight - 25, { align: "center" })

    doc.y = drawY + rowHeight
    drawLine(doc.y)

    // Vertical borders for row
    drawVerticalLine(doc.page.margins.left, drawY, doc.y)
    drawVerticalLine(doc.page.margins.left + TABLE_COLS.date, drawY, doc.y)
    drawVerticalLine(doc.page.margins.left + TABLE_COLS.date + TABLE_COLS.proceedings, drawY, doc.y)
    drawVerticalLine(doc.page.width - doc.page.margins.right, drawY, doc.y)
  }

  /* =========================
     RENDER START
     ========================= */
  drawHeader()
  drawTableHeader()

  data.entries.forEach((entry, index) => {
    drawRow(entry, index === data.entries.length - 1)
  })
}