const bcrypt = require("bcrypt");
const User = require("../models/User");

// Render Login Page
exports.getLogin = (req, res) => {
    res.render("login", { error: null });
};

// Handle Login Request
exports.postLogin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.render("login", { error: "Invalid username or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { error: "Invalid username or password" });
        }

        req.session.user = { id: user._id, username: user.username };
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Server error");
    }
};

// Render Register Page
exports.getRegister = (req, res) => {
    res.render("register", { error: null });
};

// Handle Register Request
exports.postRegister = async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render("register", { error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });

        await newUser.save();
        res.redirect("/auth/login");
    } catch (error) {
        res.status(500).send("Server error");
    }
};

// Logout User
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/auth/login");
    });
};
