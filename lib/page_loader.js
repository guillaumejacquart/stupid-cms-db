var express = require('express');
var path = require("path");
var fs = require("fs.extra");
var cheerio = require('cheerio');

module.exports = function(options) {
	
	var db = options.db;
	
	var router = express.Router();
	router.get('/:page?', function (req, res, next) {
		var page = req.params.page;
		if(!page && options.index){
			page = options.index;
		}
		
		console.log('requesting page : ' + page);
		if(!page.endsWith('.html')){
			next();
		}
		
		var filepath = path.join(options.sitePath, page);
	
		fs.access(filepath, fs.F_OK, function(){
			if(req.body){
				fs.readFile(filepath, 'utf8', function(err, data){
					if(!data){
						next();
						return;
					}
					
					$ = cheerio.load(data);
					
					db.find({page: page}, function (err, docs) {
						docs.forEach(function(d){
							elem = $('[data-content="' + d.name + '"]');
							if(elem.attr('data-repeatable') == "true"){
								if(!d.repeats){
									return;
								}
								
								d.repeats.sort(function(a, b){
									return a.index === b.index ? 0 : a.index < b.index ? -1 : 1;
								}).forEach(function(c) {										
									if(c.index === 0){
										elem.html(c.html);
									} else {
										var newEl = elem.clone().html(c.html);
										var alreadyCreated = elem.siblings('[data-repeatable]');
										if(alreadyCreated.length){
											alreadyCreated.last().after(newEl);
										} else {
											elem.after(newEl);
										}
									}
								});
							} else {
								elem.html(d.html);
								if(d.attrs){
									d.attrs.forEach(function(a){
										elem.attr(a.name, a.value);
									});
								}
							}
						});
						
						// Add minimal css and js to html.
						$('body').append('<script src="/cms/js/editable.js"></script>');
						
						res.status(200).send($.html());
					});
				});
			}			
		})	
	});
	
	return router;
};