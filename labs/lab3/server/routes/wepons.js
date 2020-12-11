const express = require('express');
const { render } = require('mustache');
const weponController = require('../controllers/wepons');
const router = express.Router();

/**
 * Get all wepons with pagination
 * @route GET /api/wepons/
 * @group Wepons - wepon operations
 * @param {integer} page.query - Number of page
 * @param {integer} per_page.query - Count of items on one page
 * @returns {Array.<Wepon>} 200 - Wepon objects
 * @returns {Error} 400 - Bad request
 */
router.get('/', weponController.getWepons);
router.use('/new', (req, res)=>res.render('creationWepon'));
/**
 * Get wepon by id
 * @route GET /api/wepons/{id}
 * @group Wepons - wepon operations
 * @param {integer} id.path.required - wepon's id
 * @returns {Wepon.model} 200 - Wepon object
 * @returns {Error} 404 - wepon not found
 */
router.get('/:id(\\d+)', weponController.getWeponById);
/**
 * Add new wepon
 * @route post /api/wepons/
 * @group Wepons - wepon operations
 * @param {Wepon.model} id.body.required - future wepon's name
 * @returns {Wepon.model} 200 - Wepon object
 * @returns {Error} 400 - Bad request
 */
router.post('/', weponController.addWepon);
/**
 * Update wepon (leave parametr empty to leave the same value)
 * @route put /api/wepons/
 * @group Wepons - wepon operations
 * @param {Wepon.model} id.body.required - wepon's id
 * @returns {Wepon.model} 200 - Wepon object
 * @returns {Error} 400 - Bad request
 * @returns {Error} 404 - wepon not found
 */
router.put('/',weponController.updateWepon);
/**
 * Delete wepon by id
 * @route DELETE /api/wepons/{id}
 * @group Wepons - wepon operations
 * @param {integer} id.path.required - wepon's id
 * @returns {Wepon.model} 200 - Wepon object
 * @returns {Error} 404 - wepon not found
 */
router.post('/:id(\\d+)', weponController.deleteWepon);

module.exports = router;
