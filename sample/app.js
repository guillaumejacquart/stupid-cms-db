var express = require("express");
var path = require("path");
var cms = require("../dist/server/cms");

var app = express();

var sitePath = path.join(__dirname, "site");
cms({
	sitePath
}, app);

module.exports = app;
