var express = require('express');
var fs = require("fs.extra");
var basicAuth = require('basic-auth');
var cheerio = require('cheerio')
var router = express.Router();
var url = require("url");
var path = require("path");

var username, password;

var config = path.join(__dirname, '/../bin/config.js')
fs.readFile(config, (err, data) => {
	if (err) throw err;
	
	var config = JSON.parse(data);
	if(config.authorization.type == "basic"){
		username = config.authorization.username;
		password = config.authorization.password;
	}
});


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

	if (user.name === username && user.pass === password) {
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
	var fileArchive = new Date().getTime() + '-' + file;
	
	var filepath = path.join(__dirname, '/../site/', file);
	var filepathArchive = path.join(__dirname, '/../archives/', fileArchive);
	
	fs.access(filepath, fs.F_OK, function(){
		if(req.body){
			var file = fs.readFileSync(filepath, 'utf8');
			$ = cheerio.load(file);
			
			elem = $($('.editable').get(req.body.index));
			elem.attr('id', req.body.id);
			
			elem.html(req.body.innerHtml);
			for (var a in req.body.attrs){
				if(a == 'id'){				
					elem.attr(req.body.attrs[a].name, req.body.attrs[a].value);
				}
			}
			
			fs.copy(filepath, filepathArchive, { replace: false }, function (err) {
				if (err) {
					throw err;
				}
				console.log("archived in file : " + filepathArchive);		
				fs.writeFile(filepath, $.html(), 'utf8', function (err) {
					if (err) return console.log(err);
				});
			});
		}
		
		res.json({status: 'OK'});
	})	
});

module.exports = router;
