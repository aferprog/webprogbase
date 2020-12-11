const express = require("express");
const router = express.Router();
const uRouter = require("./users");
const wRouter = require("./wepons");
const mRouter = require("./media");

router.use("/users/", uRouter);
router.use("/wepons/", wRouter);
router.use("/media/", mRouter);

module.exports=router;