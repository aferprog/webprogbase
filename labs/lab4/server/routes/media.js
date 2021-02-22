const mediaController = require('../controllers/media');
const router = require('express').Router();

/**
 * Add a picture
 * @route POST /api/media
 * @group Media - upload images
 * @param {file} image.formData.required - uploaded image
 * @returns {Object} 201 - added image
 * @returns {Error} 400 - Bad request
 * @returns {Error} 500 - Server error
 */

router.post("/", mediaController.addPicture);

/**
 * Get a picture by id
 * @route GET /api/media/{id}
 * @group Media - get pictures
 * @param {string} id.path.required - id of the picture - eg: 1
 * @returns {Media.model} 200 - return image
 * @returns {Error} 400 - Bad request
 * @returns {Error} 404 - Picture not found
 * @returns {Error} 500 - Server error
 */

router.get("/:id", mediaController.getPicture);

module.exports = router;