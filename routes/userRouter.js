const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const userSchema = require("../models/user");

// User signup
router.post("/signup", async (req, res) => {
  try {
    const { name, age, email, mobile, idCardNumber, password, role } = req.body;

    // Check if user already exists
    let user = await userSchema.findOne({ email });
    if (user) return res.status(401).send("User already exists!");

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user with the role (admin/voter)
    const newUser = await userSchema.create({
      name,
      email,
      age,
      mobile,
      idCardNumber,
      password: hashedPassword,
      role: role || 'voter'  // Set role, default to 'voter' if not provided
    });

    // Create a JWT token (assuming you have a generateToken function)
    const payload = { id: newUser.id };
    const token = generateToken(payload);

    // Send the response
    res.status(200).send({ newUser, token });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { idCardNumber, password } = req.body;

    let user = await userSchema.findOne({ idCardNumber });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(404).json({ error: "Invalid ID card number or password" });
    }

    const payload = { id: user.id };
    const token = generateToken(payload);

    res.json({ token });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

// Get user profile
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    // console.log(req.user.userData.id)
    const userId = req.user.userData.id; // Get user ID from JWT payload
    const user = await userSchema.findOne({_id: userId});
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user password
router.put("/:profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).send({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
