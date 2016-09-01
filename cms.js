var express = require("express");
var path = require("path");
var fs = require("fs.extra");
var cheerio = require("cheerio");
var mustacheExpress = require("mustache-express");

var Datastore = require("nedb");

module.exports = function(options, app) {
	
	app.use("/cms", express.static(path.join(__dirname, "public")));	

	// Register ".mustache" extension with The Mustache Express
	app.engine("html", mustacheExpress());

	app.set("view engine", "mustache");
	app.set("views", path.join(__dirname, "views"));
	
	var db = new Datastore({ filename: options.dbPath || "db.data", autoload: true });
	options.db = db;
	
	var pageLoader = require("./lib/page_loader")(options);	
	
	app.use(pageLoader);
	
	app.use(express.static(options.sitePath, {
		extensions: [],
		index: false
	}));
	
	var routes = require("./lib/editor")(options);
	app.use("/cms", routes);
};
