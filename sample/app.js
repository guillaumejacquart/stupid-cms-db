var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cms = require('stupid-cms');

var app = express();

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'site', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var sitePath = path.join(__dirname, 'site');
var archivesPath = path.join(__dirname, 'archives');
cms({
	sitePath: sitePath,
	archivesPath: archivesPath,
	auth: {
		type: 'basic',
		username: 'login',
		password: 'password'
	}
}, app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
	next(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  next(err);
});


module.exports = app;
