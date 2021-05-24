const router = require('express').Router();
const apiController = require('../controllers/apiController');
const bodyparser = require('body-parser');
const { get } = require('http');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

router
.get("/books/:bookId" , apiController.getBookById)
.get("/books" , apiController.getBooks)
.post("/book" , apiController.addBook)
.put("/book" , apiController.updateBook)
.post("/delete" , apiController.deleteBook)
module.exports = router;