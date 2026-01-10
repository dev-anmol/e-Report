const PDFDocument = require("pdfkit")
const fs = require("fs")
const path = require("path")

const doc = new PDFDocument({
  size: "A4",
  margin: 50
})

doc.pipe(fs.createWriteStream("marathi-test.pdf"))

// Load STATIC Devanagari font (this is now correct)
doc.font(
  path.resolve(
    __dirname,
    "../assets/fonts/NotoSansDevanagari-Regular.ttf"
  )
)

// Title
doc.fontSize(16).text("शांतता राखण्यासाठी नोटीस", { align: "center" })
doc.moveDown(2)

// Fixed legal text
doc.fontSize(12).text(
  "आपणास खालील कारणांकरिता नोटीस देण्यात येत आहे की,",
  { align: "left" }
)

doc.moveDown(1)

// Dynamic Marathi data
const accusedName = "रामचंद्र गणेश पाटील"
const address = "रा. अकोला, जिल्हा अकोला"

doc.text(
  `${accusedName}, ${address} यांनी सार्वजनिक शांततेस बाधा निर्माण केली आहे.`,
  { align: "left" }
)

doc.moveDown(2)

// Footer
doc.text("पोलीस निरीक्षक", { align: "right" })
doc.text("दिनांक: 11/01/2026", { align: "right" })

doc.end()
