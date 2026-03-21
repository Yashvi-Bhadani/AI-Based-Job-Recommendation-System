require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

//Debug code
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);



const resumeRoutes = require("./routes/resumeRoutes");
app.use("/api/resume", resumeRoutes);

// Serve uploaded files (optional, helpful for debugging)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));



// 🔥 Global error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.message);

  res.status(500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});

// app.listen(5000, () => {
//   console.log("Server running on http://localhost:5000");
// });