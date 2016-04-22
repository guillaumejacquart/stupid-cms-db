var express = require('express');
var path = require("path");

module.exports = function(options, app) {
	
	app.use('/stupid-cms', express.static(path.join(__dirname, 'public')));
	app.use(express.static(options.sitePath, {
		extensions: ['html', 'htm']
	}));
	
	var routes = require('./routes')(options);
	app.use('/stupid-cms', routes);
};
