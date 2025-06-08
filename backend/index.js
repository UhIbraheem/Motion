// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const aiRoutes = require("./routes/ai");
app.use("/", aiRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Motion backend is live 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
