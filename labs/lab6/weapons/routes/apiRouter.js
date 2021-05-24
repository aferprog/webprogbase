const router = require('express').Router();
const apiController = require('../controllers/apiController');
const bodyparser = require('body-parser');
const { get } = require('http');

router.use(bodyparser.json());
router.use(bodyparser.urlencoded({ extended: true }));

router
.get("/weapons/:weaponId" , apiController.getWeaponById)
.get("/weapons" , apiController.getWeapons)
.post("/weapons" , apiController.addWeapon)
.put("/weapons" , apiController.updateWeapon)
.post("/weapons" , apiController.deleteWeapon)
module.exports = router;