const path = require("path")
const fs = require("fs")

const LOGO_PATH = path.resolve(
  __dirname,
  "../../../../assets/logos/MHlogo.png"
)

module.exports.render = function renderNotice130(doc, data, text) {
  const PAGE_WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right

  function drawLine(y) {
    doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke()
  }

  // Header
  try {
    doc.image(LOGO_PATH, (doc.page.width / 2) - 30, doc.y, { width: 50 })
  } catch (e) { }

  doc.moveDown(3)
  doc
    .fontSize(14)
    .font(doc.fonts.bold)
    .text(text.header.department || "विशेष कार्यकारी दंडाधिकारी अहिल्यानगर", { align: "center" })
    .text(text.header.office || "यांचे समोरील कामकाज", { align: "center" })

  doc.moveDown(0.5)
  doc.fontSize(12).text(text.sectionRef || "भा.ना.सु.सं कलम 130 प्रमाणे नोटीस", { align: "center", underline: true })

  doc.moveDown(1)

  // Case Info Box
  const infoTop = doc.y
  doc.fontSize(10).font(doc.fonts.regular)

  doc.text(`विशेष कार्यकारी दंडाधिकारी अहिल्यानगर`, doc.page.width / 2, infoTop)
  doc.text(`चॅप्टर केस नंबर - ${data.caseNumber}`, doc.page.width / 2, infoTop + 15)
  doc.text(`अहिल्यानगर दि. ${data.caseDate}`, doc.page.width / 2, infoTop + 30)

  doc.moveDown(2)

  // Parties
  doc.text(`सरकार तर्फे फिर्याद - ${data.policeStationName}`, doc.page.margins.left)
  doc.moveDown(0.5)
  doc.font(doc.fonts.bold).text("विरुद्ध", { align: "left" }).font(doc.fonts.regular)
  doc.moveDown(0.5)

  doc.text("सामनेवाले - ", doc.page.margins.left)
  let accusedY = doc.y
  data.accusedPersons.forEach((p, i) => {
    doc.text(`${i + 1}) ${p.name}`, doc.page.margins.left + 100, accusedY)
    doc.text(`सर्व रा. ${p.address || "शेववस्ती अहिल्यानगर"}`, doc.page.width / 2 + 50, accusedY)
    accusedY += 15
  })

  doc.y = Math.max(accusedY, doc.y + 40)
  doc.moveDown(1)
  drawLine(doc.y)
  doc.moveDown(1)

  // Body text
  doc.fontSize(10).text(data.facts || text.opening, { align: "justify" })
  doc.moveDown(1)

  doc.text(`${text.direction || "दिनांक"} ${data.hearing.date} रोजी दुपारी ${data.hearing.time || "03:00"} वाजता विशेष कार्यकारी दंडाधिकारी शाखा, जिल्हाधिकारी कार्यालय, अहिल्यानगर येथे न चुकता हजर राहावे.`, { align: "justify" })

  doc.moveDown(2)
  doc.text(`दि. ${data.caseDate}`, doc.page.margins.left)

  doc.text("विशेष कार्यकारी दंडाधिकारी", doc.page.width - doc.page.margins.right - 150, doc.y, { align: "center" })
  doc.text("अहिल्यानगर", doc.page.width - doc.page.margins.right - 150, doc.y + 12, { align: "center" })

  doc.moveDown(2)

  // Signatures at bottom
  doc.text("प्रत - पोलीस निरीक्षक ________________ पोलीस स्टेशन अहिल्यानगर", doc.page.margins.left)

  doc.moveDown(2)
  let sigX = doc.page.margins.left
  data.accusedPersons.forEach(p => {
    if (p.signature) {
      try {
        const sigPath = path.resolve(process.cwd(), p.signature)
        if (fs.existsSync(sigPath)) {
          doc.image(sigPath, sigX, doc.y, { height: 30 })
          doc.fontSize(8).text(p.name, sigX, doc.y + 32)
          sigX += 120
          if (sigX > doc.page.width - 150) {
            sigX = doc.page.margins.left
            doc.moveDown(4)
          }
        }
      } catch (e) { }
    }
  })
}