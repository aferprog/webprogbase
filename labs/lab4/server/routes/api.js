const express = require("express");
const router = express.Router();
const uRouter = require("./users");
const wRouter = require("./wepons");
const mRouter = require("./media");
const aRouter = require("./ammo");


router.use("/users/", uRouter);
router.use("/wepons/", wRouter);
router.use("/media/", mRouter);
router.use("/ammo/", aRouter);

module.exports=router;