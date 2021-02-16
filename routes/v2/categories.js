var express = require("express");
var axios = require("axios").default;
var router = express.Router();
var _ = require("lodash");

/* GET categories listing. */
router.get("/", async (req, res, next) => {
  const appointmentTypesPromise = axios.get("/appointment-types");

  res.send(_.uniq((await appointmentTypesPromise).data.map(appointmentType => appointmentType.category)));
});

module.exports = router;
