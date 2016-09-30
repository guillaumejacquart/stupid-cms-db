var express = require("express");
var path = require("path");
var cms = require("stupid-cms-db");

var app = express();

var sitePath = path.join(__dirname, "site");
cms({
	sitePath,
	index: "index.html"
}, app);

module.exports = app;