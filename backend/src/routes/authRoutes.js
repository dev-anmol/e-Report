const express = require("express")
const router = express.Router()
const loginRateLimiter = require("../middleware/loginRateLimiter");
const authController = require("../controller/authController")
const auth = require("../middleware/authMiddleware")

router.post("/login", loginRateLimiter, authController.login)
router.post("/refresh/token", authController.refresh)
router.post("/logout", authController.logout)
router.get("/me", auth, authController.getMe)

module.exports = router

