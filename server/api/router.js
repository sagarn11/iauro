const router = require("express").Router();

router.use("/users", require("./users/router"));
router.use("/products", require("./products/router"));

module.exports = router;
