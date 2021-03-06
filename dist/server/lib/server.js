var http = require("http");
var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cms = require("../cms");
var port, server;

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    var bind = typeof port === "string" ?
        "Pipe " + port :
        "Port " + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === "string" ?
        "pipe " + addr :
        "port " + addr.port;

    console.log("Listening on " + bind);
}

module.exports = function(options) {
    var sitePath = options.sitePath;
    var dataPath = options.dataPath;

    port = options.port;

    console.log("loading static site in : " + sitePath);
    var app = express();
    app.set("port", port);

    app.use(logger("dev"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));

    cms({
        sitePath,
        dataPath
    }, app);

    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error("Not Found");
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get("env") === "development") {
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

    /**
     * Create HTTP server.
     */

    server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);
};