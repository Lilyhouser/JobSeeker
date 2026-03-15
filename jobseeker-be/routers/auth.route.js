const express = require("express");
const {
  handleLogin,
  handleLogout,
  handleSignup,
} = require("../controllers/auth.controller");
const { checkRequiredFields } = require("../middlewares");
const router = express.Router();

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.route("/logout").post(
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Logout'
  // #swagger.description = 'Clears the JWT refresh token cookie and logs the user out.'
  /* #swagger.responses[204] = { description: 'Logged out successfully' } */
  handleLogout,
);

router.route("/login").post(
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Login'
  // #swagger.description = 'Authenticates a user with email and password. Returns an access token and sets a refresh token cookie.'
  /* #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "user@example.com" },
            password: { type: "string", example: "secret123" }
          }
        }
      }
    }
  } */
  checkRequiredFields("email", "password"),
  handleLogin,
);

router.route("/register").post(
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Register'
  // #swagger.description = 'Creates a new user account and profile. Requirements differ by role.'
  /* #swagger.requestBody = {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          required: ["email", "password", "role"],
          properties: {
            email: { type: "string", example: "newuser@example.com" },
            password: { type: "string", example: "secret123" },
            role: { type: "string", enum: ["seeker", "recruiter"], example: "seeker" },
            name: { type: "string", description: "Full name (for seeker)", example: "John Doe" },
            company_name: { type: "string", description: "Company name (for recruiter)", example: "Acme Inc" },
            location: { type: "string", description: "Location (for recruiter)", example: "New York" },
            tax_code: { type: "string", description: "Tax code (for recruiter)", example: "TX123456" },
            bussiness_license: { type: "string", format: "binary", description: "Business license file (for recruiter)" }
          }
        }
      }
    }
  } */
  /* #swagger.responses[201] = { description: "User and profile registered successfully" } */
  /* #swagger.responses[400] = { description: "Missing required fields for the given role" } */
  /* #swagger.responses[409] = { description: "Email already exists" } */
  upload.single("bussiness_license"),
  handleSignup,
);

module.exports = router;
