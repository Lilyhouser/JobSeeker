const express = require("express");
const {
  getMe,
  updateSeekerProfile,
  updateRecruiterProfile,
  updatePassword,
  approveRecruiter,
  getListPedningRecruiter,
} = require("../../controllers/user.controller");
const verifyRoles = require("../../middlewares/roleMiddleware");
const ROLE = require("../../constraints/role");

const router = express.Router();

router.get(
  "/",
  // #swagger.tags = ['User']
  // #swagger.summary = 'Get list pedning recruiter'
  // #swagger.description = 'Returns the list pedning recruiter.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: "List pedning recruiter",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                id: { type: "string", example: "uuid" },
                email: { type: "string", example: "user@example.com" },
                role: { type: "string", example: "seeker" },
                status: { type: "string", example: "active" },
                created_at: { type: "string", example: "2024-01-01T00:00:00Z" },
                profile: { type: "object" }
              }
            }
          }
        }
      }
    }
  } */
  verifyRoles(ROLE.ADMIN),
  getListPedningRecruiter,
);

router.put(
  "/approve-recruiter/:id",
  // #swagger.tags = ['User']
  // #swagger.summary = 'Approve recruiter'
  // #swagger.description = 'Approves a recruiter by their ID. Admin role required.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = { description: "Recruiter approved successfully" } */
  /* #swagger.responses[403] = { description: "Forbidden – seeker or admin cannot access" } */
  verifyRoles(ROLE.ADMIN),
  approveRecruiter,
);

router.get(
  "/me",
  // #swagger.tags = ['User']
  // #swagger.summary = 'Get current user profile'
  // #swagger.description = 'Returns the logged-in user data along with their seeker or recruiter profile.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: "Current user with profile",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                id: { type: "string", example: "uuid" },
                email: { type: "string", example: "user@example.com" },
                role: { type: "string", example: "seeker" },
                status: { type: "string", example: "active" },
                created_at: { type: "string", example: "2024-01-01T00:00:00Z" },
                profile: { type: "object" }
              }
            }
          }
        }
      }
    }
  } */
  getMe,
);

router.put(
  "/password",
  // #swagger.tags = ['User']
  // #swagger.summary = 'Change password'
  // #swagger.description = 'Requires the current password to set a new one.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["oldPassword", "newPassword"],
          properties: {
            oldPassword: { type: "string", example: "oldpass123" },
            newPassword: { type: "string", example: "newpass456" }
          }
        }
      }
    }
  } */
  /* #swagger.responses[200] = { description: "Password updated successfully" } */
  /* #swagger.responses[403] = { description: "Old password is incorrect" } */
  updatePassword,
);

router.put(
  "/seeker-profile",
  // #swagger.tags = ['User']
  // #swagger.summary = 'Update seeker profile'
  // #swagger.description = 'Creates or updates the seeker profile (fullname, phone, address, skills). Seeker role required.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            fullname: { type: "string", example: "Nguyen Van A" },
            phone: { type: "string", example: "0901234567" },
            address: { type: "string", example: "Ha Noi, Vietnam" },
            skills: {
              type: "array",
              items: { type: "string" },
              example: ["JavaScript", "React", "Node.js"]
            }
          }
        }
      }
    }
  } */
  /* #swagger.responses[200] = { description: "Seeker profile updated successfully" } */
  /* #swagger.responses[403] = { description: "Forbidden – recruiter or admin cannot access" } */
  verifyRoles(ROLE.SEEKER),
  updateSeekerProfile,
);

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.put(
  "/recruiter-profile",
  // #swagger.tags = ['User']
  // #swagger.summary = 'Update recruiter profile'
  // #swagger.description = 'Creates or updates the recruiter profile (company info, tax code, etc.). Recruiter role required.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            company_name: { type: "string", example: "Acme Corp" },
            website: { type: "string", example: "https://acme.com" },
            tax_code: { type: "string", example: "0123456789" },
            exp_years: { type: "integer", example: 5 },
            location: { type: "string", example: "Ho Chi Minh City" },
            bussiness_license: { type: "string", format: "binary", description: "Business license file" },
            supplement_info: { type: "string", example: "Additional company details" }
          }
        }
      }
    }
  } */
  /* #swagger.responses[200] = { description: "Recruiter profile updated successfully" } */
  /* #swagger.responses[403] = { description: "Forbidden – seeker or admin cannot access" } */
  verifyRoles(ROLE.RECRUITER),
  upload.single("bussiness_license"),
  updateRecruiterProfile,
);

module.exports = router;
