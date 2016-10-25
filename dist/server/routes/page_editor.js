var express = require("express");
var path = require("path");
var fs = require("fs-extra");
var cheerio = require("cheerio");
var passport = require("passport");

var isAuthenticated = function(req, res, next){	
	if (req.isAuthenticated())
		return next();
	
	res.redirect("/cms/login");
}

module.exports = function(options) {
	
	var dataDb = options.dataDb;
	
	var router = express.Router();
	router.get("/", isAuthenticated, function (req, res, next) {
		var url = req.query.url;
		url = url || options.index;
		
		console.log("requesting url : " + url);			
		var page = url;
					
		dataDb.find({$or: [{ "metadata.url": url }, { page: url }]}, function (err, docs) {
			var doc = docs[0];
			if(doc && doc.metadata){
				page = doc.page;
			}
			
			console.log("corresponding page : " + page);
			
			fs.readdir(options.sitePath, function(err, files){
				var htmlFiles = files.filter(function(f) {
					return f.indexOf('.html') !== -1;
				});
				
				var filepath = path.join(options.sitePath, page);
				fs.readFile(filepath, "utf8", function(err, data){
					if(!data){
						next();
						return;
					}
					
					$ = cheerio.load(data);	
					res.render("editor.html", {
						code: $.html(),
						page: page,
						pages: htmlFiles
					});
				});
			});
		});
		return;
	});
	
	router.post("/", isAuthenticated, function (req, res, next) {
		var page = req.query.page;
		var html = req.body.html;
		console.log("Saving page : " + page);
					
		var filepath = path.join(options.sitePath, page);
		fs.writeFile(filepath, html, function(err){
			if(err){
				throw err;
				return;
			}
			
			res.json({
				status: "OK"
			})
		});
		return;
	});
	
	return router;
};
