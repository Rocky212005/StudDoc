const PDF = require("../models/PDF");
const fs = require("fs");
const path = require("path");

// Upload PDF
exports.uploadPDF = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/auth/login");
        }

        const newPDF = new PDF({
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`,
            uploadedBy: req.session.user.username,
        });

        await newPDF.save();
        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error uploading file");
    }
};

// View PDF


exports.viewPDF = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/auth/login");
        }

        const pdf = await PDF.findById(req.params.id);
        if (!pdf) {
            return res.status(404).send("PDF not found");
        }

        res.render("view", { pdf, filename: pdf.filename }); // ✅ Pass filename to EJS
    } catch (error) {
        console.error("Error retrieving PDF:", error);
        res.status(500).send("Error retrieving PDF");
    }
};


exports.downloadPDF = async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        if (!pdf) {
            return res.status(404).send("PDF not found");
        }

        const filePath = path.join(__dirname, "../uploads", pdf.filename);
        res.download(filePath, pdf.filename); // ✅ Send file as download
    } catch (error) {
        console.error("Error downloading PDF:", error);
        res.status(500).send("Error downloading PDF");
    }
};


exports.deletePDF = async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        if (!pdf) {
            return res.status(404).send("PDF not found");
        }

        const filePath = path.join(__dirname, "../uploads", pdf.filename);

        // ✅ Check if file exists before deleting
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete file
        }

        await PDF.findByIdAndDelete(req.params.id); // Remove from database
        res.redirect("/");
    } catch (error) {
        console.error("Error deleting PDF:", error);
        res.status(500).send("Error deleting PDF");
    }
};

