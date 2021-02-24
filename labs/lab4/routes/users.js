const express = require('express');
const router = express.Router();
const userController = require('../controllers/users');

/**
 * Get all users with pagination
 * @route GET /api/users/
 * @group Users - user operations
 * @param {integer} page.query - Number of page
 * @param {integer} per_page.query - Count of items on one page
 * @returns {Array.<User>} 200 - User objects
 * @returns {Error} 400 - Bad request
 */
router.get('/', userController.getUsers);

/**
 * Get user by id
 * @route GET /api/users/{id}
 * @group Users - user operations
 * @param {string} id.path - user's id
 * @returns {User.model} 200 - User object
 * @returns {Error} 404 - user not found
 */
router.get('/:id', userController.getUserById);

module.exports = router;
