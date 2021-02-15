require('dotenv').config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var axios = require("axios").default;
var logger = require("morgan");

var calendarsRouterV1 = require("./routes/v1/calendars");
var categoriesRouterV1 = require("./routes/v1/categories");
var appointmentTypesRouterV1 = require("./routes/v1/appointmentTypes");

var calendarsRouter = require("./routes/v2/calendars");
var classesRouter = require("./routes/v2/classes");

axios.defaults.baseURL = process.env.ACUITY_BASE_URL;
axios.defaults.auth = {
  username: process.env.ACUITY_USER_ID,
  password: process.env.ACUITY_API_KEY,
};

var app = express();

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "build")));

app.get(["/","/index.html.var"], function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/ping", function (req, res) {
    return res.send("pong");
});

app.use("/api/v1/calendars", calendarsRouterV1);
app.use("/api/v1/categories", categoriesRouterV1);
app.use("/api/v1/appointment-types", appointmentTypesRouterV1);

app.use("/api/v2/calendars", calendarsRouter);
app.use("/api/v2/classes", classesRouter);

app.listen(process.env.NODE_PORT || 8080);

module.exports = app;
