const router = require('express').Router();
const apiController = require('../controllers/apiController');
const bodyparser = require('body-parser');
const { get } = require('http');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

router
.get('/books/votes' , apiController.booksVotes)
.get('/books/:id/votes' , apiController.booksByIdVotes)
.get('/user/:id/votes' , apiController.userByIdVotes)
.get('/me/votes' , apiController.meVotes)

module.exports = router;