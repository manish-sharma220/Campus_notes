// import express from "express";
// import {
//   notesUploading,
//   deleteNotes,
//   updateNotes,
//   getNotes,
// } from "../controllers/uploading.controller.js";
// import { verifyToken } from "../utils/verifyUser.js";
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import { v2 as cloudinary } from "cloudinary";

// const router = express.Router();

// // 🔧 Cloudinary Config
// cloudinary.config({
//   cloud_name: "dinn2svqr",
//   api_key: "477623572645727",
//   api_secret: "58Bj2smsT6A0oV2bL9gDa-pKIOY", // Click 'View API Keys' above to copy your API secret
// });

// // 📦 Setup storage for multer
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     resource_type: "auto",
//     folder: "notes",
//     allowed_formats: ["pdf", "doc", "docx", "txt"],
//     public_id: (req, file) => `${Date.now()}-${file.originalname}`,
//     // acl: "public-read", // Ensure that ACL is set to public
//     access_mode: "public",
//   },
// });

// // const upload = multer({ storage });

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     // Check file types if needed
//     const allowedTypes = [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "text/plain",
//     ];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(
//         new Error(
//           "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed."
//         )
//       );
//     }
//   },
// });

// // 🚀 Upload route with file handling
// router.post("/upload", verifyToken, upload.single("file"), notesUploading);
// router.delete("/delete/:id", verifyToken, deleteNotes);
// router.post("/update/:id", verifyToken, updateNotes);
// router.get("/get/:id", getNotes);

// export default router;

// import express from "express";
// import {
//   notesUploading,
//   deleteNotes,
//   updateNotes,
//   getNotes,
// } from "../controllers/uploading.controller.js";
// import { verifyToken } from "../utils/verifyUser.js";
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import { v2 as cloudinary } from "cloudinary";
// import path from 'path';
// import fs from 'fs';

// const router = express.Router();

// // Create uploads directory if it doesn't exist
// const uploadsDir = path.join(process.cwd(), 'uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Cloudinary Configuration
// cloudinary.config({
//   cloud_name: "dinn2svqr",
//   api_key: "477623572645727",
//   api_secret: "58Bj2smsT6A0oV2bL9gDa-pKIOY",
// });

// // Setup storage - temporary using local storage for debugging
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// // Initialize multer with local storage
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: (req, file, cb) => {
//     console.log("Filtering file:", file.mimetype);
//     // Accept PDF, DOC, DOCX, TXT files
//     if (
//       file.mimetype === 'application/pdf' ||
//       file.mimetype === 'application/msword' ||
//       file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
//       file.mimetype === 'text/plain'
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error(Invalid file type: ${file.mimetype}. Only PDF, DOC, DOCX and TXT files are allowed.), false);
//     }
//   }
// });

// // Modified upload middleware with better debugging
// const uploadMiddleware = (req, res, next) => {
//   console.log("Starting file upload process");

//   upload.single("file")(req, res, (err) => {
//     if (err) {
//       console.error("Multer error:", err);
//       return res.status(400).json({
//         success: false,
//         message: File upload error: ${err.message}
//       });
//     }

//     console.log("File upload successful:", req.file ? "File received" : "No file received");
//     if (req.file) {
//       console.log("File details:", {
//         fieldname: req.file.fieldname,
//         originalname: req.file.originalname,
//         encoding: req.file.encoding,
//         mimetype: req.file.mimetype,
//         size: req.file.size,
//         path: req.file.path || "(No path)",
//         url: req.file.url || req.file.secure_url || "(No URL)"
//       });
//     }

//     next();
//   });
// };

// // Middleware to process the file
// const processCloudinaryResult = (req, res, next) => {
//   if (req.file) {
//     // For local storage, construct the URL
//     req.file.fileUrl = /uploads/${req.file.filename};
//     req.file.fileName = req.file.originalname;
//     req.file.fileType = req.file.mimetype;

//     console.log("Processed file:", req.file);
//   }
//   next();
// };

// // API Routes
// router.post("/create", verifyToken, uploadMiddleware, processCloudinaryResult, notesUploading);
// router.delete("/delete/:id", verifyToken, deleteNotes);
// router.post("/update/:id", verifyToken, uploadMiddleware, processCloudinaryResult, updateNotes);
// router.get("/get/:id", getNotes);

// export default router;

import express from "express";
import {
  notesUploading,
  deleteNotes,
  updateNotes,
  getNotes,
} from "../controllers/uploading.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import fs from "fs";

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage (for production use)
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "notes_uploads",
    resource_type: "auto",
    allowed_formats: ["pdf", "doc", "docx", "txt"],
  },
});

// Local storage configuration (for development or fallback)
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

// Use cloudinary storage in production, disk storage in development
const storage =
  process.env.NODE_ENV === "production" ? cloudinaryStorage : diskStorage;

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept PDF, DOC, DOCX, TXT files
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "text/plain"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only PDF, DOC, DOCX and TXT files are allowed.`
      ),
      false
    );
  }
};

// Initialize multer with configured storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Enhanced upload middleware with improved error handling
const uploadMiddleware = (req, res, next) => {
  console.log("Starting file upload process");

  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
    }

    // If no file was uploaded but there's a fileUrl in the request body, use that instead
    if (!req.file && req.body.fileUrl) {
      console.log("No file uploaded, but fileUrl provided in request body");
    } else if (req.file) {
      // For disk storage, construct a URL
      if (process.env.NODE_ENV !== "production") {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        req.file.path = req.file.path.replace(/\\/g, "/"); // Normalize path separators
        req.file.url = `${baseUrl}/${req.file.path}`;
      }

      // Ensure consistent interface for the controllers
      req.body.fileUrl = req.file.url || req.file.secure_url || req.file.path;
      req.body.fileName = req.file.originalname;
      req.body.fileType = req.file.mimetype;
    }

    next();
  });
};

// Middleware to check if there's any file content
const ensureFileContent = (req, res, next) => {
  // Check if there's either a file or a file URL in the request
  if (!req.file && !req.body.fileUrl && req.route.path !== "/update/:id") {
    return res.status(400).json({
      success: false,
      message:
        "No file content provided. Please upload a file or provide a file URL.",
    });
  }
  next();
};

// API Routes
router.post(
  "/create",
  verifyToken,
  uploadMiddleware,
  ensureFileContent,
  notesUploading
);
router.delete("/delete/:id", verifyToken, deleteNotes);
router.post("/update/:id", verifyToken, uploadMiddleware, updateNotes);
router.get("/get/:id", getNotes);

// Serve uploaded files in development
if (process.env.NODE_ENV !== "production") {
  router.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
}

export default router;
