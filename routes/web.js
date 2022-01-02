const { showHomePage } = require("../controller/webController");
const express = require("express");
const router = express.Router();

router.route("/").get(showHomePage);

module.exports = router;
