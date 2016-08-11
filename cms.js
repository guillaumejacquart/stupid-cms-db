var express = require('express');
var path = require("path");
var fs = require("fs.extra");
var cheerio = require('cheerio');

var Datastore = require('nedb')
  , db = new Datastore({ filename: 'db.data', autoload: true });

module.exports = function(options, app) {
	
	app.use('/stupid-cms', express.static(path.join(__dirname, 'public')));
	
	app.use(express.static(options.sitePath, {
		extensions: [],
		index: false
	}));
	
	var router = express.Router();
	router.get('/:page', function (req, res, next) {
		console.log(req.params.page);
		var filepath = path.join(options.sitePath, req.params.page + '.html');
	
		fs.access(filepath, fs.F_OK, function(){
			if(req.body){
				fs.readFile(filepath, 'utf8', function(err, data){
					console.log(data);
					$ = cheerio.load(data);
					
					db.find({}, function (err, docs) {
						docs.forEach(function(d){
							elem = $('#' + d.id);							
							elem.html(d.html);
						});
						res.status(200).send($.html());
					});
				});
			}			
		})	
	});
	app.use(router);
	
	options.db = db;
	var routes = require('./routes')(options);
	app.use('/stupid-cms', routes);
};
