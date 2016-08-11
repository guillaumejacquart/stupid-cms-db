var express = require('express');
var fs = require("fs.extra");
var basicAuth = require('basic-auth');
var cheerio = require('cheerio');
var router = express.Router();
var url = require("url");
var path = require("path");
var mkdirp = require('mkdirp');

var options,
	db;

/* GET user infos. */
router.get('/user', function(req, res, next) {
	var user = basicAuth(req);
	res.json(user && user.name);
});

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

/* GET admin page. */
router.get('/admin', auth, function(req, res, next) {
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
		id: req.body.id,
		html: req.body.innerHtml,
		attrs: handledAttributes,
		page: file
	}
	
	db.find({id: content.id}, function (err, docs) {
		if(docs.length){	
			db.update({ id: content.id }, { $set: content }, {}, function (err, numReplaced) {
				res.status(200).json({ id: content });
			});
		} else {
			db.insert(content, function (err, newDoc) {
				res.status(200).json({ id: req.body.id });
			});
		}
	})
});

module.exports = function(auth){
	options = auth;
	db = options.db;
	
	return router;
}
