var express = require("express");
var axios = require("axios").default;
var router = express.Router();

/* GET classes listing. */
router.get("/", async (req, res, next) => {
  const { month } = req.query;

  const appointmentTypesPromise = axios.get("/appointment-types");
  const classesPromise = axios.get(`/availability/classes?month=${month}`);

  const appointmentTypesMap = (await appointmentTypesPromise).data.reduce((acc, curr) => {
    acc[curr.id] = curr;
    return acc;
  }, {});

  res.send((await classesPromise).data.filter(c => appointmentTypesMap[c.appointmentTypeID]).map(c => {
    const { schedulingUrl, image } = appointmentTypesMap[c.appointmentTypeID];
    return {
      schedulingUrl,
      image,
      ...c,
    };
  }));
});

module.exports = router;
