const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    // User must be authenticated first
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required"
      })
    }

    const userRole = req.user.role

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Access denied. Insufficient permissions."
      })
    }

    next()
  }
}

module.exports = checkRole