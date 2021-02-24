const express = require('express');
const weponController = require('../controllers/wepons');
const router = express.Router();

/**
 * Get all weapons with pagination
 * @route GET /api/wepons/
 * @group Weapons - weapon operations
 * @param {integer} page.query - Number of page
 * @param {integer} per_page.query - Count of items on one page
 * @returns {Array.<Weapon>} 200 - Weapon objects
 * @returns {Error} 400 - Bad request
 */
router.get('/', weponController.getWepons);
/**
 * Get weapon by id
 * @route GET /api/wepons/{id}
 * @group Weapons - weapon operations
 * @param {string} id.path.required - weapon's id
 * @returns {Weapon.model} 200 - Weapon object
 * @returns {Error} 404 - weapon not found
 */
router.get('/:id', weponController.getWeponById);
/**
 * Add new weapon
 * @route post /api/wepons/
 * @group Weapons - weapon operations
 * @param {Weapon.model} weapon.body.required - future weapon's name
 * @returns {Weapon.model} 200 - Weapon object
 * @returns {Error} 400 - Bad request
 */
router.post('/', weponController.addWepon);
/**
 * Update weapon (leave parametr empty to leave the same value)
 * @route put /api/wepons/
 * @group Weapons - weapon operations
 * @param {Weapon.model} weapon.body.required - weapon's id
 * @returns {Weapon.model} 200 - Weapon object
 * @returns {Error} 400 - Bad request
 * @returns {Error} 404 - wepon not found
 */
router.put('/',weponController.updateWepon);
/**
 * Delete weapon by id
 * @route DELETE /api/wepons/{id}
 * @group Weapons - weapon operations
 * @param {string} id.path.required - weapon's id
 * @returns {Weapon.model} 200 - Weapon object
 * @returns {Error} 404 - wepon not found
 */
router.delete('/:id', weponController.deleteWepon);

module.exports = router;
