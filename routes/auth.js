const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Render Register Page
router.get("/register", (req, res) => {
    res.render("register");
});

// Handle User Registration
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send("User already exists. Please login.");
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.redirect("/auth/login");
    } catch (error) {
        res.status(500).send("Error registering user.");
    }
});

// Render Login Page
router.get("/login", (req, res) => {
    res.render("login");
});

// Handle User Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by email
        const user = await User.findOne({ username });
        if (!user) {
            return res.send("Invalid credentials33.");
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.send("Invalid credentials2.");
        }

        // Store user session
        req.session.user = { username: user.username, email: user.email };
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error logging in.");
    }
});

// Handle Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/auth/login");
    });
});

module.exports = router;
