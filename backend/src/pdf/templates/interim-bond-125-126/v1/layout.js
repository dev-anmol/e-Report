const path = require("path")
const fs = require("fs")

const LOGO_PATH = path.resolve(
  __dirname,
  "../../../../assets/logos/MHlogo.png"
)

module.exports.render = function renderInterimBond(doc, data, text) {
  const PAGE_WIDTH = doc.page.width - doc.page.margins.left - doc.page.margins.right

  // Header
  try {
    doc.image(LOGO_PATH, (doc.page.width / 2) - 25, doc.y, { width: 50 })
    doc.moveDown(3)
  } catch (e) { }

  doc
    .fontSize(14)
    .font(doc.fonts.bold)
    .text(text.header.govt || "शांतता राखण्यासाठी अंतरिम बंधपत्र", { align: "center" })
    .fontSize(11)
    .text(text.title.section || "(कलम 125 व 126 पहा)", { align: "center" })

  doc.moveDown(1.5)

  // Body content
  doc.fontSize(10).font(doc.fonts.regular)

  const topY = doc.y
  doc.text(`मी श्री. ${data.accused.name}`, doc.page.margins.left + 20, topY)
  doc.text(`रा. ${data.accused.address || "शेववस्ती अहिल्यानगर"}`, doc.page.width / 2 + 50, topY)

  doc.moveDown(1)
  doc.text(`अहिल्याननगर यास सहा महिने अवधीपर्यंत किवा, चॅप्टर केस न. ${data.caseNumber || "1766/2023"} च्या बाबतीत सध्या विशेष कार्यकारी दंडाधिकारी, अहिल्यानगर यांच्या न्यायालयात प्रलंबित असलेली चौकशी पूर्ण होईपर्यंत शांतता राखण्याकरिता बंधपत्र लिहून देण्यास सांगण्यात आले आहे, म्हणून उक्त अवधीत किवा उक्त चौकशी पूर्ण होईपर्यंत शांतताभंग न करण्यास किवा ज्यामुळे शांतता भंग होण्याचा संभव आहे अशी कोणतीही कृती न करण्यास मी याद्वारे स्वतःला बांधून घेत आहे, आणि या कामी माझ्याकडून कोणतीही कसूर झाल्यास, रक्कम रु. ${data.bond.amount || "20000"}/- गमावून ती सरकारजमा करण्यास याद्वारे मी स्वतःस बांधून घेत आहे.`, { align: "justify", lineGap: 4 })

  doc.moveDown(1)
  doc.text(`आज दि. ${new Date(data.executionDate || Date.now()).toLocaleDateString("mr-IN")}`, doc.page.margins.left)

  // Accused Signature
  if (data.accused.signature) {
    try {
      const sigPath = path.resolve(process.cwd(), data.accused.signature)
      if (fs.existsSync(sigPath)) {
        doc.image(sigPath, doc.page.width - doc.page.margins.right - 120, doc.y - 20, { height: 35 })
      }
    } catch (e) { }
  }
  doc.text("__________________________", { align: "right" })
  doc.text("(स्वाक्षरी)", { align: "right" })

  doc.moveDown(1)
  doc.text("समक्ष", { align: "center" })
  doc.moveDown(1)

  // Magistrate Info
  doc.text("विशेष कार्यकारी दंडाधिकारी", doc.page.margins.left, doc.y)
  doc.text("अहिल्यानगर", doc.page.margins.left, doc.y + 12)

  doc.moveDown(2)

  // Surety Section (if available)
  if (data.sureties && data.sureties.length > 0) {
    drawLine(doc, doc.y)
    doc.moveDown(1)

    data.sureties.forEach((s, i) => {
      doc.text(`उपरोक्त इसम ${s.name} रा. ${s.address || "शेववस्ती अहिल्यानगर"} यांस वर उल्लेखलेला काळ किंवा उक्त चौकशी पूर्ण होईपर्यंत शासनाशी व भपरावच्या सर्व नागरिकांशी शांतपणे व वर्तणुक ठेवण्याची शाश्वती आम्ही याद्वारे स्वतःस जामीनदार म्हणून घोषित करीत आहोत, आणि त्याने कसूर केल्यास, रु. ${data.bond.amount || "20000"}/- इतकी रक्कम गमावून ती सरकारजमा करण्यास स्वतःस संयुक्तपणे व अलग अलगपणे बांधून घेत आहोत.`, { align: "justify", lineGap: 4 })
      doc.moveDown(0.5)
    })

    doc.text(`आज दि. ${new Date(data.executionDate || Date.now()).toLocaleDateString("mr-IN")}`, doc.page.margins.left)

    doc.moveDown(1)
    doc.text("__________________________", { align: "right" })
    doc.text("जामीनदारांची सही", { align: "right" })

    doc.moveDown(1)
    doc.text("विशेष कार्यकारी दंडाधिकारी", doc.page.margins.left, doc.y)
    doc.text("अहिल्यानगर", doc.page.margins.left, doc.y + 12)
  }
}

function drawLine(doc, y) {
  doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke()
}