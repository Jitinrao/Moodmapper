// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places");
const authRoutes = require("./routes/auth-simple");
const favoritesRoutes = require("./routes/favorites");
const recentlyViewedRoutes = require("./routes/recentlyViewed");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5001;

// Export for Vercel
module.exports = app;

/* =========================
   DATABASE
========================= */

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
  });

/* =========================
   CORS (allow everything in development)
========================= */

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: "*",
  })
);

/* =========================
   HELMET (disable cross origin policy)
========================= */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* =========================
   RATE LIMIT
========================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

app.use(limiter);

/* =========================
   BODY PARSER
========================= */

app.use(express.json());

/* =========================
   ROUTES
========================= */

app.use("/api/places", placesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/recently-viewed", recentlyViewedRoutes);

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   START SERVER (for local development)
========================= */

// Only start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
}