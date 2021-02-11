var express = require("express");
var axios = require("axios").default;
var router = express.Router();

var constants = require("../../constants");
var asyncFilter = require("../../util").asyncFilter;

/* GET appointmentTypes listing. */
router.get("/", async (req, res, next) => {
  const category = req.query.category;

  const appointmentTypes = (await axios.get("/appointment-types")).data;
  
  res.send(await asyncFilter(appointmentTypes, async (type) => (
    type.category
    && type.active
    && type.calendarIDs.length > 0
    && (!category || category === type.category)
    && constants.categories.includes(type.category)
  )));
});

module.exports = router;
