const router = require("express").Router();
router.use("/", require("./getProduct").router);
module.exports = router;
