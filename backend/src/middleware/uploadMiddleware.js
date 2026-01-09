const multer = require("multer")

const storage = multer.memoryStorage()

function imageOnly(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files allowed"), false)
  }
  cb(null, true)
}

function pdfOrImage(req, file, cb) {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype.startsWith("image/")
  ) {
    return cb(null, true)
  }
  cb(new Error("Only PDF or image allowed"), false)
}

const uploadSignature = multer({
  storage,
  fileFilter: imageOnly,
  limits: { fileSize: 2 * 1024 * 1024 }
}).single("signature")

const uploadPhoto = multer({
  storage,
  fileFilter: imageOnly,
  limits: { fileSize: 3 * 1024 * 1024 }
}).single("photo")

const uploadDocument = multer({
  storage,
  fileFilter: pdfOrImage,
  limits: { fileSize: 10 * 1024 * 1024 }
}).single("document")

module.exports = {
  uploadSignature,
  uploadPhoto,
  uploadDocument
}
