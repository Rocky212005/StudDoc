const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("./models/User");
const PDF = require("./models/PDF");
const authRoutes = require("./routes/auth");
const pdfRoutes = require("./routes/pdf");

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect("mongodb://localhost:27017/pdf-reader", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: true,
    })
);
app.use("/auth", authRoutes);
app.use("/pdf", pdfRoutes);
app.get("/", async (req, res) => {
    if (!req.session.user) return res.redirect("/auth/login");
    const pdfs = await PDF.find({ uploadedBy: req.session.user.username });
    res.render("index", { user: req.session.user, pdfs });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
