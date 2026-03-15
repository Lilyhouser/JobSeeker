const express = require("express");
const multer = require("multer");
const { uploadCv } = require("../../controllers/seeker.controller");
const verifyRoles = require("../../middlewares/roleMiddleware");
const ROLE = require("../../constraints/role");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed!"), false);
    }
  },
});

router.post(
  "/cv",
  // #swagger.tags = ['User']
  // #swagger.summary = 'Upload CV (PDF)'
  // #swagger.description = 'Uploads a PDF CV to Supabase Storage and appends its URL to the seeker profile cv_url array. Seeker role required.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          required: ["cv"],
          properties: {
            cv: {
              type: "string",
              format: "binary",
              description: "PDF file to upload (max 10MB)"
            }
          }
        }
      }
    }
  } */
  /* #swagger.responses[200] = {
    description: "CV uploaded successfully",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "CV uploaded successfully!" },
            url: { type: "string", example: "https://xxx.supabase.co/storage/v1/object/public/cvs/uid/cv.pdf" },
            cv_url: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  url: { type: "string" },
                  uploaded_at: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  } */
  /* #swagger.responses[400] = { description: "No file uploaded or file is not a PDF" } */
  /* #swagger.responses[403] = { description: "Forbidden – recruiter role cannot upload CVs" } */
  verifyRoles(ROLE.SEEKER),
  upload.single("cv"),
  uploadCv,
);

module.exports = router;
