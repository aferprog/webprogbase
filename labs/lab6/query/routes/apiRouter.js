const router = require('express').Router();
const apiController = require('../controllers/apiController');
const bodyparser = require('body-parser');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

router
.get('/weapons/votes' , apiController.weaponsVotes)
.get('/weapons/:id/votes' , apiController.weaponsByIdVotes)
.get('/user/:id/votes' , apiController.userByIdVotes)
.get('/me/votes' , apiController.meVotes)

module.exports = router;