const path = require("path")
const fs = require("fs-extra")
const crypto = require("crypto")
const puppeteerService = require("./puppeteerService")

/**
 * mode: "DRAFT" | "ISSUED" | "PREVIEW"
 */
async function generatePdf({ pages, outputPath, mode = "DRAFT" }) {
  const commonCss = await fs.readFile(
    path.join(__dirname, "html-templates", "base.css"),
    "utf-8"
  )

  const logoPath = "file://" + path.resolve(process.cwd(), "src/assets/logos/MHlogo.png")

  const puppeteerPages = pages.map((page) => {
    const templateName = page.type.toLowerCase().replace(/_/g, "-")
    const templatePath = path.join(__dirname, "html-templates", `${templateName}.hbs`)

    // Prepare data based on template requirements
    // We might need some mapping here if data structure changed
    const data = {
      ...page.data,
      commonCss,
      logoPath,
      currentDate: new Date().toLocaleDateString("mr-IN")
    }

    // Fix absolute paths for signatures if they exist
    if (data.accused?.signature) {
      data.accused.signature = "file://" + path.resolve(process.cwd(), data.accused.signature)
    }
    if (data.surety?.signature) {
      data.surety.signature = "file://" + path.resolve(process.cwd(), data.surety.signature)
    }
    if (data.entries) {
      data.entries = data.entries.map(entry => ({
        ...entry,
        presentAccused: entry.presentAccused?.map(p => ({
          ...p,
          signature: p.signature ? "file://" + path.resolve(process.cwd(), p.signature) : null
        }))
      }))
    }

    return {
      templatePath,
      data
    }
  })

  const result = await puppeteerService.generateMultiPage({
    pages: puppeteerPages,
    outputPath
  })

  if (mode === "ISSUED") {
    const buffer = await fs.readFile(outputPath)
    const hash = crypto
      .createHash("sha256")
      .update(buffer)
      .digest("hex")

    return {
      path: outputPath,
      hash
    }
  }

  return { path: outputPath }
}

module.exports = {
  generatePdf
}