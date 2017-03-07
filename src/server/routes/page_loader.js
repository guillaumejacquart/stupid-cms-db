var express = require("express");
var path = require("path");
var fs = require("fs-extra");
var cheerio = require("cheerio");

module.exports = function(options) {
	
	var dataDb = options.dataDb;
	
	var router = express.Router();
	router.get("/:url?", function (req, res, next) {		
		var url = req.params.url;	
		url = url || options.index;
		
		console.log("requesting url : " + url);			
		var page = url;
					
		dataDb.find({$or: [{ "metadata.url": url }, { page: url }]}, function (err, docs) {
			var doc = docs[0];
			if(doc && doc.metadata){
				page = doc.page;
				var title = doc.metadata.title;
			} 
			
			if(path.extname(page) != '.html' && path.extname(page) != '.htm'){
				return next();
			}
			
			console.log("corresponding page : " + page);
			
			var filepath = path.join(options.sitePath, page);
			fs.readFile(filepath, "utf8", function(err, data){
				if(!data){
					next();
					return;
				}
				
				var $ = cheerio.load(data);
				
				if(doc && doc.contents instanceof Array){
					doc.contents.forEach(function(d){
						var elem = $("[data-content=\"" + d.name + "\"]");
						if(elem.attr("data-repeatable") === "true"){
							if(!d.repeats){
								return;
							}
							
							d.repeats.sort(function(a, b){
								return a.repeatIndex === b.repeatIndex ? 0 : a.repeatIndex < b.repeatIndex ? -1 : 1;
							}).forEach(function(c) {										
								if(c.repeatIndex === 0){
									elem.html(c.innerHtml);
								} else {
									var newEl = elem.clone().html(c.innerHtml);
									var alreadyCreated = elem.siblings("[data-repeatable]");
									if(alreadyCreated.length){
										alreadyCreated.last().after(newEl);
									} else {
										elem.after(newEl);
									}
								}
							});
						} else {
							elem.html(d.innerHtml);
							if(d.attrs){
								d.attrs.forEach(function(a){
									if(a.name == "src"){
										elem.attr(a.name, a.value);
									}
								});
							}
						}
					});
				}

				if(title){
					$('title').html(title);
				}
				
				// Add minimal css and js to html.
				$("body").append("<script src=\"/cms/js/app.js\"></script>");
				$("body").append("<script src=\"/cms/js/dependencies.js\"></script>");
				$("body").append("<script src=\"/cms/js/tinymce/tinymce.min.js\"></script>");
				$("body").append("<input id=\"cms-page-name\" type=\"hidden\" value=\"" + page + "\"/>");

				$("head").append("<link href=\"/cms/css/dependencies.css\" rel=\"stylesheet\">");
				$("head").append("<link href=\"/cms/css/app.css\" rel=\"stylesheet\">");
				
				res.status(200).send($.html());
			});
		});
	});
	
	return router;
};
