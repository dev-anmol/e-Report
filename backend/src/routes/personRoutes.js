// src/routes/personRoutes.js
const express = require("express")
const router = express.Router()

const auth = require("../middleware/authMiddleware")
const uploadMiddleware = require("../middleware/uploadMiddleware")

// Controllers
const { createPerson } = require("../controller/personController")
const {
  uploadSignature,
  uploadPhoto,
  uploadDocument,
  getPersonFile
} = require("../controller/personFileController")

router.use(auth)

// Create person
router.post("/cases/:caseId/persons", createPerson)

// File uploads
router.post(
  "/persons/:personId/upload/signature",
  uploadMiddleware.uploadSignature,
  uploadSignature
)

router.post(
  "/persons/:personId/upload/photo",
  uploadMiddleware.uploadPhoto,
  uploadPhoto
)

router.post(
  "/persons/:personId/upload/document",
  uploadMiddleware.uploadDocument,
  uploadDocument
)

// Get signed URL for a person's file
// :type must be one of: signature | photo | document
router.get("/persons/:personId/files/:type", getPersonFile)

module.exports = router