const express = require('express');
const weaponController = require('./weaponsController');
const router = express.Router();

router.get('/weapons', weaponController.getWeapons);
router.get('/weapons/:id', weaponController.getWeaponById);
router.post('/weapons', weaponController.addWeapon);
router.delete('/weapons', weaponController.deleteWeapon);
router.put('/weapons', weaponController.updateWeapon);

module.exports = router;