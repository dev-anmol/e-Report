const Person = require("../model/person")

const { uploadFile, getSignedUrl } = require("../service/fileUploadService") 

// Upload signature
async function uploadSignature(req, res, next) {
  try {
    const { personId } = req.params
    if (!req.file) return res.status(400).json({ message: "Signature missing" })

    const person = await Person.findById(personId)
    if (!person) return res.status(404).json({ message: "Person not found" })

    const ext = req.file.mimetype.split("/")[1] || "png"
    const path = `persons/signatures/${personId}.${ext}`

    await uploadFile({ buffer: req.file.buffer, path, contentType: req.file.mimetype })

    person.files = person.files || {}
    person.files.signature = path
    await person.save()

    res.json({ success: true, path })
  } catch (err) {
    next(err)
  }
}

// Upload photo
async function uploadPhoto(req, res, next) {
  try {
    const { personId } = req.params
    if (!req.file) return res.status(400).json({ message: "Photo missing" })

    const person = await Person.findById(personId)
    if (!person) return res.status(404).json({ message: "Person not found" })

    const ext = req.file.mimetype.split("/")[1] || "jpg"
    const path = `persons/photos/${personId}.${ext}`

    await uploadFile({ buffer: req.file.buffer, path, contentType: req.file.mimetype })

    person.files = person.files || {}
    person.files.photo = path
    await person.save()

    res.json({ success: true, path })
  } catch (err) {
    next(err)
  }
}

// Upload document (pdf or image)
async function uploadDocument(req, res, next) {
  try {
    const { personId } = req.params
    if (!req.file) return res.status(400).json({ message: "Document missing" })

    const person = await Person.findById(personId)
    if (!person) return res.status(404).json({ message: "Person not found" })

    const ext = req.file.mimetype === "application/pdf"
      ? "pdf"
      : (req.file.mimetype.split("/")[1] || "pdf")

    const path = `persons/documents/${personId}.${ext}`

    await uploadFile({ buffer: req.file.buffer, path, contentType: req.file.mimetype })

    person.files = person.files || {}
    person.files.document = path
    await person.save()

    res.json({ success: true, path })
  } catch (err) {
    next(err)
  }
}

// Get signed URL for a person's file
async function getPersonFile(req, res, next) {
  try {
    const { personId, type } = req.params
    if (!["signature", "photo", "document"].includes(type)) {
      return res.status(400).json({ message: "Invalid file type" })
    }

    const person = await Person.findById(personId)
    if (!person) return res.status(404).json({ message: "Person not found" })

    const path = person.files && person.files[type]
    if (!path) return res.status(404).json({ message: "File not found" })

    const signedUrl = await getSignedUrl(path, 300) // expiry seconds
    res.json({ url: signedUrl })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  uploadSignature,
  uploadPhoto,
  uploadDocument,
  getPersonFile
}
