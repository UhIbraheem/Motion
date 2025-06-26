// backend/index.js - Network Access Fix
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));
app.use(express.json());

const aiRoutes = require("./routes/ai");
app.use("/", aiRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Motion backend is live 🚀");
});

// Listen on all network interfaces (not just localhost)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Mobile access: http://[YOUR_IP]:${PORT}`);
  console.log(`💻 Local access: http://localhost:${PORT}`);
});