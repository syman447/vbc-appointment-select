require('dotenv').config();

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var axios = require("axios").default;
var logger = require("morgan");

var calendarsRouter = require("./routes/calendars");
var categoriesRouter = require("./routes/categories");
var appointmentTypesRouter = require("./routes/appointmentTypes");

axios.defaults.baseURL = process.env.ACUITY_BASE_URL;
axios.defaults.auth = {
  username: process.env.ACUITY_USER_ID,
  password: process.env.ACUITY_API_KEY,
};

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "build")));

app.get(["/appointment-select","/appointment-select/index.html.var"], function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/ping", function (req, res) {
    return res.send("pong");
});

app.use("/api/calendars", calendarsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/appointment-types", appointmentTypesRouter);

app.listen(process.env.NODE_PORT || 8080);

module.exports = app;
