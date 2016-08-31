var express = require("express");
var fs = require("fs.extra");
var basicAuth = require("basic-auth");
var cheerio = require("cheerio");
var router = express.Router();
var url = require("url");
var path = require("path");
var uuid = require("node-uuid");

var options,
	db,
	dataManager;

var auth = function (req, res, next) {
	function unauthorized(res) {
		res.set("WWW-Authenticate", "Basic realm=Authorization Required");
		return res.sendStatus(401);
	};

	var user = basicAuth(req);
	if (!user || !user.name || !user.pass || user.name !== options.auth.username || user.pass !== options.auth.password) {
		return unauthorized(res);
	} else {
		return next();
	}
};

function getPage(req){	
	var referer = req.get("Referer");
	var parsed = url.parse(referer);
	var file = path.basename(parsed.pathname);
	
	if(file.length === 0){
		file = "index.html";
	}
	
	if(file.indexOf(".html") === -1){
		file += ".html";
	}
	
	return file;
}

/* GET user infos. */
router.get("/edition", auth, function(req, res, next) {
	var user = basicAuth(req);
	var filepath = path.join(options.sitePath, "templates");
	
	fs.readdir(filepath, function(err, files){
		res.render("cms-bar.html", { user: user, templates: files });
	});
});

/* GET user infos. */
router.get("/user", function(req, res, next) {
	var user = basicAuth(req);
	res.json(user);
});

/* Force login page. */
router.get("/login", auth, function(req, res, next) {
	res.redirect("/");
});

/* POST edit content page. */
router.post("/edit", auth, function(req, res, next) {		
	dataManager.editContent(req.body.name, getPage(req), req.body.innerHtml, req.body.attrs, req.body.repeatIndex, function(err){
		if(err) throw err;
		res.status(200).json({status: "OK"});
	});
});

/* POST remove content repeatable. */
router.post("/remove", auth, function(req, res, next) {
	dataManager.removeRepeatable(req.body.name, getPage(req), req.body.repeatIndex, function(err){
		if(err) throw err;
		res.status(200).json({status: "OK"});		
	});
});

/* POST remove content repeatable. */
router.post("/order", auth, function(req, res, next) {
	dataManager.orderRepeatable(req.body.name, getPage(req), req.body.repeatIndex, req.body.newRepeatIndex, function(err){
		if(err) throw err;
		res.status(200).json({status: "OK"});		
	});
});

/* POST make content repeatable. */
router.post("/editable", auth, function(req, res, next) {	
	var selector = req.body.selector;
	var page = getPage(req);
	
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
router.delete("/editable/:id", auth, function(req, res, next) {
	
	var id = req.params.id;
	var page = getPage(req);
	
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

module.exports = function(auth){
	options = auth;
	db = options.db;
	
	dataManager = require("./data_manager")(db);

	return router;
};
