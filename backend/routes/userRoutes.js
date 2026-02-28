const express = require("express");
const router = express.Router();
const User = require("../models/User");


// ✅ REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.json({ message: "User already exists" });
  }

  const newUser = new User({ name, email, password, role });
  await newUser.save();

  res.json({ message: "User registered successfully" });
});


// ✅ LOGIN (ADD THIS BELOW REGISTER)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ message: "User not found" });
  }

  if (user.password !== password) {
    return res.json({ message: "Invalid password" });
  }

  res.json({ message: "Login successful", user });
});

module.exports = router;