var express = require("express");
var fs = require("fs.extra");
var cheerio = require("cheerio");
var router = express.Router();
var url = require("url");
var path = require("path");
var uuid = require("node-uuid");
var exporter = require('./site_exporter');
var multer = require('multer');
var upload = multer({ dest: __dirname + '/../uploads/' })
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var options,
	dataManager,
	userManager;

passport.use(new LocalStrategy(
	function(username, password, done) {
		userManager.findOne(username, function (err, user) {
			if (err) { return done(err); }
			if (!user) {
				return done(null, false, { message: 'Incorrect username.' });
			}
			if (!userManager.validatePassword(user, password)) {
				return done(null, false, { message: 'Incorrect password.' });
			}
			return done(null, user);
		});
	}
));

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
router.post("/login", passport.authenticate('local'), function(req, res, next) {
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
			
			passport.authenticate('local')(req, res, function () {
				res.redirect('/');
			});
		});
	});
});

/* Get logout page. */
router.get("/logout", isAuthenticated, function(req, res, next) {
	req.logout();
	res.redirect("/");
});

/* GET user infos. */
router.get("/user", function(req, res, next) {	
	if(!req.isAuthenticated()){
		res.json(false);
		return;
	}
	
	var user = req.user;
	var page = req.query.page;
	
	dataManager.getPage(req.query.page, function(data){	
		user.lastUpdatedAt = data.lastUpdatedAt;
		res.status(200).json(user);
	});	
});

/* GET edition infos. */
router.get("/edition", isAuthenticated, function(req, res, next) {
	var page = req.query.page;
	var filepath = path.join(options.sitePath, page);
	fs.readdir(filepath, function(err, files){
		res.render("cms-bar.html", { user: req.user });
	});
});

/* GET page metadata infos. */
router.get("/metadata", isAuthenticated, function(req, res, next) {	
	dataManager.getMetadata(req.query.page, function(data){		
		res.status(200).json(data);
	});
});

/* POST page metadata infos. */
router.post("/metadata", isAuthenticated, function(req, res, next) {	
	var metadata = {
		url: req.body.url
	}
	
	dataManager.saveMetadata(metadata, req.query.page, function(err){
		if(err){
			res.status(400).json(err);
			return;
		}
		
		res.json({status: "OK"});
	});
});

/* POST edit the whole page contents. */
router.post("/edit-page", isAuthenticated, function(req, res, next) {		
	dataManager.editPageContents(req.body, req.query.page, function(err){
		if(err) {
			throw err;
		}
		res.status(200).json({status: "OK"});
	});
});

/* POST upload image. */
router.post("/upload", upload.single('cms_image_upload'), function(req, res, next) {		
	res.json({
		path: 'uploads/' + req.file.filename
	});
});

/* GET upload image. */
router.get("/export", isAuthenticated, function(req, res, next) {
	exporter(options).exportSite(function(exportFile){
		var stat = fs.statSync(exportFile);

		res.writeHead(200, {
			'Content-Type': 'application/zip',
			'Content-Length': stat.size
		});

		var readStream = fs.createReadStream(exportFile);
		readStream.pipe(res);
		
		//once the file is sent, send 200 and delete the file from the server
		readStream.on('end', function ()
		{
			fs.remove(exportFile);
			return res.status(200);
		});
	});
});

/* POST remove content repeatable. */
router.post("/remove", isAuthenticated, function(req, res, next) {
	dataManager.removeRepeatable(req.body.name, req.query.page, req.body.repeatIndex, function(err){
		if(err) throw err;
		res.status(200).json({status: "OK"});		
	});
});

/* POST make content repeatable. */
router.post("/editable", isAuthenticated, function(req, res, next) {	
	var selector = req.body.selector;
	var page = req.query.page;
	
	if(!selector){
		next();
		return;
	}
	
	var filepath = path.join(options.sitePath, page);
	dataManager.makeElemEditable(selector, filepath, function(err, name){
		if (err){			
			res.status(400).json(err);
			return;			
		}
		res.status(200).json({name: name});
	});	
});

/* POST remove content repeatable. */
router.delete("/editable/:id", isAuthenticated, function(req, res, next) {
	
	var id = req.params.id;
	var page = req.query.page;
	
	if(!id){
		next();
		return;
	}
	
	var filepath = path.join(options.sitePath, page);
	dataManager.destroyElemEditable(id, filepath, function(err, name){
		if (err) throw err;
		res.status(200).json({name: name});
	});	
});

module.exports = function(opt){
	options = opt;
	
	dataManager = require("./data_manager")(options.dataDb);
	userManager = require("./user_manager")(options.userDb);

	return router;
};
