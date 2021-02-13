var express = require("express");
var axios = require("axios").default;
var router = express.Router();

var constants = require("../../constants");
var asyncFilter = require("../../util").asyncFilter;

/* GET calendars listing. */
router.get("/", async (req, res, next) => {
  const calendars = (await axios.get("/calendars")).data;

  const appointmentTypes = (await axios.get("/appointment-types")).data;

  const validAppointmentTypes = await asyncFilter(appointmentTypes, async (type) => (
    type.category
    && type.active
    && type.calendarIDs.length > 0
    && constants.categories.includes(type.category)
  ));

  const validCalendars = validAppointmentTypes.reduce((acc, curr) => acc.concat(curr.calendarIDs), []);

  res.send(calendars.filter(calendar => validCalendars.includes(calendar.id)));
});

module.exports = router;
