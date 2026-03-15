const express = require("express");
const {
  applyForJob,
  getMyApplications,
  updateApplicationStatus,
} = require("../../controllers/application.controller");
const verifyRoles = require("../../middlewares/roleMiddleware");
const ROLE = require("../../constraints/role");

const router = express.Router();

router.get(
  "/me",
  // #swagger.tags = ['Apply']
  // #swagger.summary = 'Get my applications'
  // #swagger.description = 'Get my job applications'
  // #swagger.security = [{ "bearerAuth": [] }]

  /* #swagger.parameters['page'] = {
  in: 'query',
  description: 'Page number',
  type: 'integer'
} */

  /* #swagger.parameters['recordPerPage'] = {
  in: 'query',
  description: 'Items per page',
  type: 'integer'
} */

  /* #swagger.parameters['status'] = {
  in: 'query',
  description: 'Application status',
  type: 'string'
} */

  /* #swagger.responses[200] = {
  description: "Success"
} */

  /* #swagger.responses[403] = {
  description: "Forbidden"
} */
  verifyRoles(ROLE.SEEKER),
  getMyApplications,
);

router.put(
  "/:id/status",
  // #swagger.tags = ['Apply']
  // #swagger.summary = 'Update application status (Recruiter)'
  // #swagger.description = 'Recruiter updates the status of an application for one of their jobs.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = { in: 'path', description: 'Application ID' } */
  /* #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", example: "considering" }
          }
        }
      }
    }
  } */
  /* #swagger.responses[200] = { description: 'Success' } */
  verifyRoles(ROLE.RECRUITER),
  updateApplicationStatus,
);

router.post(
  "/",
  // #swagger.tags = ['Apply']
  // #swagger.summary = 'Apply for a job'
  // #swagger.description = 'Submits a job application for the logged-in seeker. Prevents duplicate applications and rejects inactive jobs.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["job_id"],
          properties: {
            job_id: { type: "string", example: "uuid-of-job" },
            custom_cv_url: {
              type: "string",
              description: "Optional URL to a specific CV to use for this application",
              example: "https://storage.example.com/cvs/my-cv.pdf"
            },
            cover_letter: {
              type: "string",
              description: "Optional cover letter text",
              example: "I am very interested in this position because..."
            }
          }
        }
      }
    }
  } */
  /* #swagger.responses[201] = { description: "Application submitted successfully" } */
  /* #swagger.responses[400] = { description: "job_id missing or job is no longer active" } */
  /* #swagger.responses[403] = { description: "Forbidden – recruiter role cannot apply for jobs" } */
  /* #swagger.responses[404] = { description: "Job not found" } */
  /* #swagger.responses[409] = { description: "Already applied for this job" } */
  verifyRoles(ROLE.SEEKER),
  applyForJob,
);

module.exports = router;
