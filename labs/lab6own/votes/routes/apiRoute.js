const router = require('express').Router();
const apiController = require('../controllers/apiController');
const bodyparser = require('body-parser');
const { get } = require('http');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

router
.post("/vote" , apiController.vote)
.post("/unvote" , apiController.unvote)

module.exports = router;