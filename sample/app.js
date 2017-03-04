var express = require("express");
var path = require("path");
var cms = require("../dist/server/cms");

var app = express();

var sitePath = path.join(__dirname, "site");
cms({
	sitePath,
	index: "index.html",
	dbPath: __dirname,
	siteName: 'sample'
}, app);

module.exports = app;
