var express = require('express');
var fs = require("fs.extra");
var basicAuth = require('basic-auth');
var cheerio = require('cheerio');
var router = express.Router();
var url = require("url");
var path = require("path");

var options,
	db;

var auth = function (req, res, next) {
	function unauthorized(res) {
		res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
		return res.sendStatus(401);
	};

	var user = basicAuth(req);
	if (!user || !user.name || !user.pass) {
		return unauthorized(res);
	};

	if (user.name === options.auth.username && user.pass === options.auth.password) {
		return next();
	} else {
		return unauthorized(res);
	};
};

/* GET user infos. */
router.get('/edition', auth, function(req, res, next) {
	var user = basicAuth(req);
	var filepath = path.join(options.sitePath, 'templates');
	
	fs.readdir(filepath, function(err, files){
		res.render('cms-bar.html', { user: user, templates: files });
	});
});

/* GET user infos. */
router.get('/user', function(req, res, next) {
	var user = basicAuth(req);
	res.json(user);
});

/* Force login page. */
router.get('/login', auth, function(req, res, next) {
	res.redirect('/');
});

/* POST edit content page. */
router.post('/edit', auth, function(req, res, next) {
	var referer = req.get('Referer');
	var parsed = url.parse(referer);
	var file = path.basename(parsed.pathname);
	
	if(file.length == 0){
		file = 'index.html';
	}
	
	if(file.indexOf('.html') === -1){
		file += '.html';
	}
	
	if(req.body.attrs){
		var handledAttributes = req.body.attrs.filter(function(a){
			return ['src'].indexOf(a.name) !== -1;
		});
	}
	
	var content = {
		name: req.body.name,
		page: file
	}
	
	db.find({name: content.name, page: content.page}, function (err, docs) {
		if(docs.length){
			if(typeof(req.body.repeatIndex) !== 'undefined'){
				content.repeats = docs[0].repeats || [];
				var existingRepeat = content.repeats.filter(function(r){ return r.index == req.body.repeatIndex });
				console.log(existingRepeat);
				if(existingRepeat.length > 0){
					existingRepeat[0].html = req.body.repeatHtml;
				} else {
					content.repeats.push({
						index: req.body.repeatIndex,
						html: req.body.repeatHtml,
						attrs: handledAttributes
					});
				}
			} else {				
				content.html = req.body.innerHtml;
				content.attrs = handledAttributes;
			}
			
			db.update({ name: content.name }, { $set: content }, {}, function (err, numReplaced) {
				res.status(200).json(content);
			});
		} else {
			if(typeof(req.body.repeatIndex) !== 'undefined'){
				content.repeats = [{
					index: req.body.repeatIndex,
					html: req.body.repeatHtml,
					attrs: handledAttributes
				}];
			} else {				
				content.html = req.body.innerHtml;
				content.attrs = handledAttributes;
			}
						
			db.insert(content, function (err, newDoc) {
				res.status(200).json(content);
			});
		}
	})
});

/* POST edit content page. */
router.post('/remove', auth, function(req, res, next) {
	var referer = req.get('Referer');
	var parsed = url.parse(referer);
	var file = path.basename(parsed.pathname);
	
	if(file.length == 0){
		file = 'index.html';
	}
	
	if(file.indexOf('.html') === -1){
		file += '.html';
	}
	
	var content = {
		name: req.body.name,
		page: file
	}
	
	db.find({name: content.name, page: content.page}, function (err, docs) {
		if(docs.length){
			content.repeats = docs[0].repeats || [];
			var existingRepeat = content.repeats.filter(function(r){ return r.index == req.body.repeatIndex });
			if(existingRepeat.length > 0){
				content.repeats.splice(existingRepeat.index, 1);
			}
			
			db.update({ name: content.name }, { $set: content }, {}, function (err, numReplaced) {
				res.status(200).json(content);
			});
		} 
	})
});

module.exports = function(auth){
	options = auth;
	db = options.db;
	
	return router;
}
