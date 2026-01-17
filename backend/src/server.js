require("dotenv").config()

const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const xss = require("xss-clean");

const connectDB = require("./config/mongoConfig")
const authRoutes = require("./routes/authRoutes")
const caseRoutes = require("./routes/caseRoutes")
const personRoutes = require("./routes/personRoutes")
const policeStationRoutes = require("./routes/policeStationRoutes")
const formRoutes = require("./routes/formRoutes")
const adminRoutes = require("./routes/adminRoutes")
const rateLimiter = require("./middleware/rateLimitterMiddleware");

const app = express()

// MIDDLEWARE ORDER (IMPORTANT)
app.use(express.json())
app.use(cookieParser())  
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(helmet())
app.use(morgan("dev"))


app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// XSS protection
app.use(xss());

// Global Rate Limiter
app.use(rateLimiter);

// Health check
app.get("/", (req, res) => {
  res.send("E-Report API is running 🚀");
});

// Routes
app.use("/", authRoutes)
app.use("/", caseRoutes)
app.use("/", personRoutes)
app.use("/", policeStationRoutes)
app.use("/", formRoutes)
app.use("/", adminRoutes)


const PORT = process.env.PORT || 8011;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});