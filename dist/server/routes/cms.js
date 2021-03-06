var express = require("express");
var fs = require("fs-extra");
var router = express.Router();
var path = require("path");
var uuid = require("uuid");
var exporter = require("../managers/export_manager");
var multer = require("multer");
var unzip = require("unzip");

var options,
	dataManager,
	exportManager,
	uploadImage,
	uploadSite,
	publicDir;

var isAuthenticated = function(req, res, next){	
	if (req.isAuthenticated())
		return next();
	
	res.redirect(401, "/cms/login");
}

module.exports = function(opt){
	options = opt;
	
	dataManager = require("../managers/data_manager")(options.dataDb);
	exportManager = exporter(options);

	uploadImage = multer({ dest: opt.uploadImageDir });
	uploadSite = multer({ dest: opt.uploadSiteDir });
	publicDir = opt.publicDir;

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
			url: req.body.url,
			title: req.body.title
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
			
			exportManager.exportSite(publicDir, function(folder){			
				res.status(200).json({status: "OK"});
			});
		});
	});

	/* POST upload image. */
	router.post("/upload-image", uploadImage.single("cms_image_upload"), function(req, res, next) {		
		res.json({
			path: "uploads-image/" + req.file.filename
		});
	});

	/* POST upload site files. */
	router.post("/upload-site", uploadSite.single("cms_site_upload"), function(req, res, next) {		
		var file = req.file.path;
		fs.readdir(options.sitePath, function (err, files) {
			if (err){
				throw err;
			}
			
			files.filter((f) => path.join(options.sitePath, f).indexOf(options.appEnvPath) === -1)
				 .forEach((f) => fs.removeSync(f));
			
			fs.createReadStream(file).pipe(unzip.Extract({ 
				path: options.sitePath 
			})).on('close', function(){
				exportManager.exportSite(publicDir, function(folder){			
					res.status(200).json({status: "OK"});
				});
			});
		})
		
	});

	/* GET upload image. */
	router.get("/export", isAuthenticated, function(req, res, next) {
		exportManager.exportSite(path.join('../export', uuid.v4()), function(folder){
			exportManager.generateZip(folder, function(exportFile){
				var stat = fs.statSync(exportFile);

				res.writeHead(200, {
					"Content-Type": "application/zip",
					"Content-Length": stat.size
				});

				var readStream = fs.createReadStream(exportFile);
				readStream.pipe(res);
				
				//once the file is sent, send 200 and delete the file from the server
				readStream.on("end", function ()
				{
					fs.remove(exportFile);
					return res.status(200);
				});
			})
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

	return router;
};
