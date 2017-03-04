var express = require("express");
var path = require("path");
var fs = require("fs-extra");
var cheerio = require("cheerio");
var mustacheExpress = require("mustache-express");
var Datastore = require("nedb");
var passport = require("passport");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var uuid = require('uuid');
var passport = require("passport")
  , LocalStrategy = require("passport-local").Strategy;

module.exports = function(options, app) {

	options.sitePath = options.sitePath || '.';
	options.dbPath = options.sitePath || '.';
	options.siteName = options.siteName || uuid.v1();

	var appEnvPath = path.join(process.env.HOME, ".stupid-cms");
	var siteEnvPath = path.join(appEnvPath, options.siteName);

	// Create environment directories
	fs.ensureDirSync(appEnvPath);
	fs.ensureDirSync(siteEnvPath);
	
	options.dataDb = new Datastore({ filename: path.join(siteEnvPath, "pages.data"), autoload: true });
	options.userDb = new Datastore({ filename: path.join(siteEnvPath, "users.data"), autoload: true });	

	options.uploadImageDir = path.join(siteEnvPath, "uploads-image");
	options.uploadSiteDir = path.join(siteEnvPath, "uploads-site");
	options.publicDir = path.join(siteEnvPath, "public");

	// Register ".mustache" extension with The Mustache Express
	app.engine("html", mustacheExpress());
	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json());
	app.use(session({ 
		secret: uuid.v1(),
		resave: false,
		saveUninitialized: true,
	}));

	app.set("view engine", "mustache");
	app.set("view cache", false);
	app.set("views", path.join(__dirname, "views"));
	
	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(id, done) {
		options.userDb.findOne({ _id: id }, function(err, user) {
			done(err, user);
		});
	});
	
	app.use(passport.initialize());
	app.use(passport.session());	
	
	var userManager = require("./managers/user_manager")(options.userDb);
	passport.use(new LocalStrategy(
		function(username, password, done) {
			userManager.findOne(username, function (err, user) {
				if (err) { return done(err); }
				if (!user) {
					return done(null, false, { message: "Incorrect username." });
				}
				if (!userManager.validatePassword(user, password)) {
					return done(null, false, { message: "Incorrect password." });
				}
				return done(null, user);
			});
		}
	));
	
	var pageEditor = require("./routes/page_editor")(options);
	app.use("/editor", pageEditor);
	
	var pageLoader = require("./routes/page_loader")(options);
	app.use(pageLoader);
	
	fs.stat(options.publicDir, function (err, stats){
		if (err) {
			fs.copy(options.sitePath, options.publicDir, function (err) {
				if (err) return console.error(err);
			});
		}
	});
	
	app.use("/", express.static(options.publicDir));
	
	app.use("/uploads-site", express.static(options.uploadSiteDir));
	app.use("/uploads-image", express.static(options.uploadImageDir));

	app.use("/cms", express.static(path.join(__dirname, "../client")));
	
	var userRoute = require("./routes/user")(options);
	app.use("/cms", userRoute);
	
	var cmsRoute = require("./routes/cms")(options);
	app.use("/cms", cmsRoute);
};
