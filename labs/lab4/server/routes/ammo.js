const router = require("express").Router();
const ammoController = require("../controllers/ammo");
/**
 * Get all ammo with pagination
 * @route GET /api/ammo/
 * @group Ammo - ammo operations
 * @param {integer} page.query - Number of page
 * @param {integer} per_page.query - Count of items on one page
 * @returns {Array.<Ammo>} 200 - Wepon objects
 * @returns {Error} 400 - Bad request
 */
router.get('/',ammoController.getAmmo);
/**
 * Get ammo by id
 * @route GET /api/ammo/{id}
 * @group Ammo - ammo operations
 * @param {string} id.path.required - wepon's id
 * @returns {Ammo.model} 200 - Wepon object
 * @returns {Error} 404 - wepon not found
 */
router.get('/:id',ammoController.getAmmoById);
/**
 * Delete wepon by id
 * @route DELETE /api/ammo/{id}
 * @group Ammo - ammo operations
 * @param {string} id.path.required - ammo's id
 * @returns {Ammo.model} 200 - Ammo object
 * @returns {Error} 404 - ammo not found
 */
router.delete('/:id', ammoController.deleteAmmo);
/**
 * Add new wepon
 * @route post /api/ammo/
 * @group Ammo - ammo operations
 * @param {Ammo.model} ammo.body.required - future ammo
 * @returns {Wepon.model} 200 - new Ammo object
 * @returns {Error} 400 - Bad request
 */
router.post('/', ammoController.addAmmo);
/**
 * Update ammo
 * @route put /api/ammo/
 * @group Ammo - ammo operations
 * @param {Ammo.model} ammo.body.required - new ammo
 * @returns {Ammo.model} 200 - Ammo object
 * @returns {Error} 400 - Bad request
 * @returns {Error} 404 - ammo not found
 */
router.put('/', ammoController.updateAmmo);

module.exports = router;