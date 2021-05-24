const router = require('express').Router();
const apiController = require('../controllers/apiController');
const bodyparser = require('body-parser');
const { get } = require('http');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

router
.post("/register" , apiController.register)
.post("/login" , apiController.login)
.get("/usernameExists" , apiController.usernameExists)
.get("/users/:userId" , apiController.userById)
.get("/users" , apiController.users)
.get("/me" ,  apiController.me)

module.exports = router;