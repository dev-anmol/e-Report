const rateLimit = require("express-rate-limit");

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // strict for login
  message: { success: false, message: "Too many login attempts. Try later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = loginRateLimiter;
