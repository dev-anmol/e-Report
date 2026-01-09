// src/scripts/testUpload.js
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { uploadFile, getSignedUrl } = require('../services/fileUploadService')

async function run() {
  try {
    const personId = 'test-person-123' // test id; in real flow use real personId
    const localPath = path.join(__dirname, '..', '..', 'test-data', 'sample.pdf')
    const buffer = fs.readFileSync(localPath)
    const destPath = `persons/documents/${personId}.pdf`
    const uploaded = await uploadFile({
      buffer,
      path: destPath,
      contentType: 'application/pdf'
    })
    console.log('Uploaded path:', uploaded)

    const url = await getSignedUrl(destPath, 60) // 60 seconds
    console.log('Signed URL (60s):', url)
    process.exit(0)
  } catch (err) {
    console.error('Upload failed:', err)
    process.exit(1)
  }
}

run()