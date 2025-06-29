const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    path: { type: String, required: true },
    uploadedBy: { type: String, required: true }, // Stores the username of the uploader
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PDF", pdfSchema);
