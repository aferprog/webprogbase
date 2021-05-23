const express = require('express');
const voteController = require('./voteController');
const router = express.Router();

router.post('/vote', voteController.vote);
router.post('/unvote', voteController.unvote);

module.exports = router;