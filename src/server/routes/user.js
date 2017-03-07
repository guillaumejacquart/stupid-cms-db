var express = require("express");
var router = express.Router();
var passport = require("passport");

var options,
	userManager;

var isAuthenticated = function(req, res, next){	
	if (req.isAuthenticated())
		return next();
	
	res.redirect(401, "/cms/login");
}

/* Get login page. */
router.get("/login", function(req, res, next) {
	var error = req.flash('error');
	userManager.hasAny(function(err, hasAny){
		if(!hasAny || err){			
			return res.render("register.html");			
		}
		
		if(req.isAuthenticated()){
			return res.redirect("/");
		}
		
		res.render("login.html", {error: error});
	});	
});

/* Post login page. */
router.post("/login", passport.authenticate("local", { 
		successRedirect: '/',
    	failureRedirect: '/cms/login',
    	failureFlash: true 
	}), function(req, res, next) {
	
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
	
	userManager = require("../managers/user_manager")(options.userDb);

	return router;
};
