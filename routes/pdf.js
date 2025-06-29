const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const PDF = require("../models/PDF");
const authMiddleware = require("../middleware/authMiddleware");
const pdfController = require("../controllers/pdfController"); 

const router = express.Router();

// Set up storage for PDF uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

// File filter to accept only PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only PDF files are allowed"), false);
    }
};

const upload = multer({ storage, fileFilter });
router.get("/upload", authMiddleware, (req, res) => {
    res.render("upload");
});


// Route to upload a PDF
router.post("/upload", upload.single("pdf"), async (req, res) => {
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
});
router.post("/delete/:id", authMiddleware, pdfController.deletePDF);
router.get("/delete/:id", authMiddleware, async (req, res) => {
    try {
        const pdf = await PDF.findById(req.params.id);
        if (!pdf) {
            return res.status(404).send("PDF not found");
        }

        const filePath = path.join(__dirname, "../uploads", pdf.filename);
        
        // Delete the file from the server
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete from the database
        await PDF.findByIdAndDelete(req.params.id);

        res.redirect("/"); // Redirect to the home page after deletion
    } catch (error) {
        console.error("Error deleting PDF:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/view/:id", authMiddleware, pdfController.viewPDF);

router.get("/download/:id", authMiddleware, pdfController.downloadPDF);
// Route to view a PDF
router.get("/view/:id", authMiddleware, async (req, res) => {
    const pdf = await PDF.findById(req.params.id);
    if (!pdf) return res.status(404).send("PDF not found");
    const filename=pdf.filename;
    res.render("view", { filename:filename });
});
// router.get("/view/:id", authMiddleware,pdfController.viewPDF, async (req, res) => {
//     try {
//         if (!req.session.user) {
//             return res.redirect("/auth/login");
//         }

//         const pdf = await PDF.findById(req.params.id);
//         if (!pdf) {
//             return res.status(404).send("PDF not found");
//         }
//          const filename=pdf.filename;
//          console.log("Filename passed to view:", filename);
//          res.render("view", { filename:filename});
//     } catch (error) {
//         res.status(500).send("Error retrieving PDF");
//     }
// });




// Route to delete a PDF
router.post("/delete/:id", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/auth/login");
        }

        const pdf = await PDF.findById(req.params.id);
        if (!pdf) {
            return res.status(404).send("PDF not found");
        }

        // Delete file from storage
        fs.unlinkSync(`public${pdf.path}`);

        // Delete PDF record from DB
        await PDF.findByIdAndDelete(req.params.id);

        res.redirect("/");
    } catch (error) {
        res.status(500).send("Error deleting PDF");
    }
});

module.exports = router;
