var express = require("express");
var fs = require("fs.extra");
var basicAuth = require("basic-auth");
var cheerio = require("cheerio");
var router = express.Router();
var url = require("url");
var path = require("path");
var uuid = require("node-uuid");
var exporter = require('./site_exporter');
var multer = require('multer');
var upload = multer({ dest: __dirname + '/../uploads/' })

var options,
	dataDb,
	metadataDb,
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

/* Force login page. */
router.get("/login", auth, function(req, res, next) {
	res.redirect("/");
});

/* GET user infos. */
router.get("/user", function(req, res, next) {
	var user = basicAuth(req);
	
	if(!user){
		res.json(user);
		return;
	}
	
	var page = req.query.page;
	
	dataManager.getPage(req.query.page, function(data){	
		user.lastUpdatedAt = data.lastUpdatedAt;
		res.status(200).json(user);
	});	
});

/* GET edition infos. */
router.get("/edition", auth, function(req, res, next) {
	var user = basicAuth(req);
	
	var page = req.query.page;
	var filepath = path.join(options.sitePath, page);
	fs.readdir(filepath, function(err, files){
		res.render("cms-bar.html", { user: user });
	});
});

/* GET page metadata infos. */
router.get("/metadata", auth, function(req, res, next) {	
	dataManager.getMetadata(req.query.page, function(data){		
		res.status(200).json(data);
	});
});

/* POST page metadata infos. */
router.post("/metadata", auth, function(req, res, next) {	
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
router.post("/edit-page", auth, function(req, res, next) {		
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
router.get("/export", auth, function(req, res, next) {
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
router.post("/remove", auth, function(req, res, next) {
	dataManager.removeRepeatable(req.body.name, req.query.page, req.body.repeatIndex, function(err){
		if(err) throw err;
		res.status(200).json({status: "OK"});		
	});
});

/* POST remove content repeatable. */
router.post("/order", auth, function(req, res, next) {
	dataManager.orderRepeatable(req.body.name, req.query.page, req.body.repeatIndex, req.body.newRepeatIndex, function(err){
		if(err) throw err;
		res.status(200).json({status: "OK"});		
	});
});

/* POST make content repeatable. */
router.post("/editable", auth, function(req, res, next) {	
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
router.delete("/editable/:id", auth, function(req, res, next) {
	
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
	dataDb = options.dataDb;
	metadataDb = options.metadataDb;
	
	dataManager = require("./data_manager")(dataDb, metadataDb);

	return router;
};
