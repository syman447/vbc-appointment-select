var express = require("express");
var router = express.Router();
var _ = require("lodash");

var constants = require("../../constants");

/* GET categories listing. */
router.get("/", async (req, res, next) => {
  res.send(constants.categories);
});

module.exports = router;
