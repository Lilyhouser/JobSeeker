const express = require("express");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../../controllers/category.controller");
const verifyRoles = require("../../middlewares/roleMiddleware");
const ROLE = require("../../constraints/role");

const router = express.Router();

router.get(
  "/",
  // #swagger.tags = ['Category']
  // #swagger.summary = 'Get all job categories'
  // #swagger.description = 'Returns a list of all job categories.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: "List of job categories",
    schema: {
      success: true,
      data: [{
        id: "uuid",
        name: "IT",
        description: "Information Technology"
      }]
    }
  } */
  getCategories,
);

router.post(
  "/",
  // #swagger.tags = ['Category']
  // #swagger.summary = 'Create a new job category'
  // #swagger.description = 'Allows admin to create a new job category.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "IT" },
            description: { type: "string", example: "Information Technology" }
          }
        }
      }
    }
  } */
  verifyRoles(ROLE.ADMIN),
  createCategory,
);

router.put(
  "/:id",
  // #swagger.tags = ['Category']
  // #swagger.summary = 'Update a job category'
  // #swagger.description = 'Allows admin to update an existing job category.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = { in: 'path', required: true, description: 'Category ID' } */
  /* #swagger.requestBody = {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            name: { type: "string", example: "Software Development" },
            description: { type: "string", example: "Software dev" }
          }
        }
      }
    }
  } */
  verifyRoles(ROLE.ADMIN),
  updateCategory,
);

router.delete(
  "/:id",
  // #swagger.tags = ['Category']
  // #swagger.summary = 'Delete a job category'
  // #swagger.description = 'Allows admin to delete a job category.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = { in: 'path', required: true, description: 'Category ID' } */
  verifyRoles(ROLE.ADMIN),
  deleteCategory,
);

module.exports = router;
