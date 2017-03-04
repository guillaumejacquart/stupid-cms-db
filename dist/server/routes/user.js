var express = require("express");
var fs = require("fs-extra");
var cheerio = require("cheerio");
var router = express.Router();
var url = require("url");
var path = require("path");
var uuid = require("uuid");
var multer = require("multer");
var unzip = require("unzip");
var uploadImage = multer({ dest: __dirname + "/../uploads-image/" });
var uploadSite = multer({ dest: __dirname + "/../uploads-site/" });
var passport = require("passport");

var options,
	dataManager,
	userManager;

var isAuthenticated = function(req, res, next){	
	if (req.isAuthenticated())
		return next();
	
	res.redirect(401, "/cms/login");
}

/* Get login page. */
router.get("/login", function(req, res, next) {
	userManager.hasAny(function(err, hasAny){
		if(!hasAny || err){			
			return res.render("register.html");			
		}
		
		if(req.isAuthenticated()){
			return res.redirect("/");
		}
		res.render("login.html");
	});	
});

/* Post login page. */
router.post("/login", passport.authenticate("local"), function(req, res, next) {
	res.redirect("/");
});

/* Post register page. */
router.post("/register", function(req, res, next) {
	userManager.hasAny(function(hasAny){
		if(hasAny){
			res.redirect(401, "/cms/login");
		}
	
		userManager.register({ username : req.body.username, password: req.body.password }, function(account, err) {
			if (err) {
				return res.render("register.html", {info: "Sorry. That username already exists. Try again."});
			}
			
			passport.authenticate("local")(req, res, function () {
				res.redirect("/");
			});
		});
	});
});

/* Get logout page. */
router.get("/logout", isAuthenticated, function(req, res, next) {
	req.logout();
	res.redirect("/");
});

module.exports = function(opt){
	options = opt;
	
	dataManager = require("../managers/data_manager")(options.dataDb);
	userManager = require("../managers/user_manager")(options.userDb);

	return router;
};
