const jwtUtil = require("../utils/jwt")

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      })
    }

    const token = authHeader.split(" ")[1]
    const payload = jwtUtil.verifyAccessToken(token)

    req.user = {
      id: payload.id,
      role: payload.role
    }

    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    })
  }
}

module.exports = authMiddleware