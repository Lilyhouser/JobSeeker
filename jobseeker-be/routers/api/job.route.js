const express = require("express");
const {
  postJob,
  getJobs,
  getJobById,
  getApplicants,
  getRecruiterJobs,
} = require("../../controllers/job.controller");
const verifyRoles = require("../../middlewares/roleMiddleware");
const ROLE = require("../../constraints/role");

const router = express.Router();

router.get(
  "/recruiter/my-jobs",
  // #swagger.tags = ['Job']
  // #swagger.summary = 'List my jobs (Recruiter)'
  // #swagger.description = 'Returns a list of jobs posted by the logged-in recruiter.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer' } */
  /* #swagger.parameters['recordPerPage'] = { in: 'query', type: 'integer' } */
  /* #swagger.parameters['status'] = { in: 'query', type: 'string' } */
  /* #swagger.responses[200] = { description: 'Success' } */
  verifyRoles(ROLE.RECRUITER),
  getRecruiterJobs,
);

router.get(
  "/",
  // #swagger.tags = ['Job']
  // #swagger.summary = 'Get jobs'
  // #swagger.description = 'Get paginated job list with optional filters.'
  // #swagger.security = [{ "bearerAuth": [] }]

  /* #swagger.parameters['page'] = {
  in: 'query',
  description: 'Page number'
} */

  /* #swagger.parameters['recordPerPage'] = {
  in: 'query',
  description: 'Records per page'
} */

  /* #swagger.parameters['keyword'] = {
  in: 'query',
  description: 'Search keyword'
} */

  /* #swagger.parameters['location'] = {
  in: 'query',
  description: 'Job location'
} */

  /* #swagger.parameters['job_type'] = {
  in: 'query',
  description: 'Job type (full_time | part_time | remote)'
} */

  /* #swagger.parameters['status'] = {
  in: 'query',
  description: 'Job status (open | closed | expired)'
} */

  /* #swagger.responses[200] = {
  description: 'Success'
} */

  getJobs,
);

router.post(
  "/",
  // #swagger.tags = ['Job']
  // #swagger.summary = 'Post a new job vacancy'
  // #swagger.description = 'Creates a new job posting with optional category associations. Recruiter role required.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["title", "description", "job_type", "ended_at"],
          properties: {
            title: { type: "string", example: "Senior Frontend Developer" },
            description: { type: "string", example: "We are looking for a skilled frontend developer..." },
            location: { type: "string", example: "Ha Noi, Vietnam" },
            position: { type: "string", example: "Frontend Developer" },
            salary_min: { type: "number", example: 1500 },
            salary_max: { type: "number", example: 3000 },
            job_type: { type: "string", enum: ["full_time", "part_time", "remote"], example: "full_time" },
            ended_at: { type: "string", format: "date-time", example: "2025-06-30T00:00:00Z" },
            requirement: { type: "string", example: "3+ years of React experience" },
            benefit: { type: "string", example: "Health insurance, 13th month salary" },
            recruite_quantity: { type: "integer", example: 3 },
            exp_year: { type: "integer", example: 2 },
            category_ids: {
              type: "array",
              items: { type: "string" },
              example: ["uuid-cat-1", "uuid-cat-2"]
            }
          }
        }
      }
    }
  } */
  /* #swagger.responses[201] = { description: "Job posted successfully" } */
  /* #swagger.responses[400] = { description: "Missing required fields" } */
  /* #swagger.responses[403] = { description: "Forbidden – seeker role cannot post jobs" } */
  verifyRoles(ROLE.RECRUITER),
  postJob,
);

router.get(
  "/:id",
  // #swagger.tags = ['Job']
  // #swagger.summary = 'Get job detail'
  // #swagger.description = 'Returns a single job with its categories and recruiter company info.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = { in: 'path', required: true, description: 'Job UUID', schema: { type: 'string' } } */
  /* #swagger.responses[200] = { description: "Job detail with categories" } */
  /* #swagger.responses[404] = { description: "Job not found" } */
  getJobById,
);

router.get(
  "/:id/applicants",
  // #swagger.tags = ['Job']
  // #swagger.summary = 'Get applicants for a job'
  // #swagger.description = 'Returns all applicants who applied for this job. Only accessible by the recruiter who owns the job.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = { in: 'path', required: true, description: 'Job UUID', schema: { type: 'string' } } */
  /* #swagger.responses[200] = {
    description: "List of applicants with seeker profile",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            job_title: { type: "string" },
            total: { type: "integer" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  cover_letter: { type: "string" },
                  custom_cv_url: { type: "string" },
                  status: { type: "string" },
                  applied_at: { type: "string" },
                  seekerprofile: { type: "object" }
                }
              }
            }
          }
        }
      }
    }
  } */
  /* #swagger.responses[403] = { description: "Forbidden – not the owner of this job" } */
  /* #swagger.responses[404] = { description: "Job not found" } */
  verifyRoles(ROLE.RECRUITER),
  getApplicants,
);

module.exports = router;
