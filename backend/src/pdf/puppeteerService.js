const puppeteer = require("puppeteer-core")
const chromium = require("@sparticuz/chromium")
const handlebars = require("handlebars")
const fs = require("fs-extra")
const path = require("path")

/**
 * PDF Service using Puppeteer
 */
class PuppeteerService {
    constructor() {
        this.browser = null
    }

    async init() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless
            })
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close()
            this.browser = null
        }
    }

    /**
     * Generates PDF from HTML template
     * @param {Object} options
     * @param {string} options.templatePath - Path to .hbs file
     * @param {Object} options.data - Data for template
     * @param {string} options.outputPath - Path to save PDF
     * @param {Object} options.pdfOptions - Puppeteer PDF options
     */
    async generateFromTemplate({ templatePath, data, outputPath, pdfOptions = {} }) {
        await this.init()
        const page = await this.browser.newPage()

        try {
            const templateContent = await fs.readFile(templatePath, "utf-8")
            const template = handlebars.compile(templateContent)
            const html = template(data)

            await page.setContent(html, { waitUntil: "networkidle0" })

            const defaultOptions = {
                path: outputPath,
                format: "A4",
                printBackground: true,
                margin: {
                    top: "20px",
                    right: "20px",
                    bottom: "20px",
                    left: "20px"
                }
            }

            await page.pdf({ ...defaultOptions, ...pdfOptions })
            return { path: outputPath }
        } finally {
            await page.close()
        }
    }

    /**
     * Multi-page PDF generation (Joining multiple templates/data)
     * This is useful for concatenating Roznama and other forms.
     */
    async generateMultiPage({ pages, outputPath, pdfOptions = {} }) {
        await this.init()
        const page = await this.browser.newPage()

        try {
            let fullHtml = `
        <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;700&display=swap');
              body { font-family: 'Noto Serif Devanagari', serif; margin: 0; padding: 0; }
              .page-break { page-break-after: always; }
              .page-break:last-child { page-break-after: auto; }
            </style>
          </head>
          <body>
      `

            for (let i = 0; i < pages.length; i++) {
                const { templatePath, data } = pages[i]
                const templateContent = await fs.readFile(templatePath, "utf-8")
                const template = handlebars.compile(templateContent)
                const html = template(data)

                fullHtml += `<div class="page-container">${html}</div>`
                if (i < pages.length - 1) {
                    fullHtml += `<div class="page-break"></div>`
                }
            }

            fullHtml += `</body></html>`

            await page.setContent(fullHtml, { waitUntil: "networkidle0" })

            const defaultOptions = {
                path: outputPath,
                format: "A4",
                printBackground: true,
                margin: {
                    top: "40px",
                    right: "40px",
                    bottom: "40px",
                    left: "40px"
                }
            }

            await page.pdf({ ...defaultOptions, ...pdfOptions })
            return { path: outputPath }
        } finally {
            await page.close()
        }
    }
}

module.exports = new PuppeteerService()
