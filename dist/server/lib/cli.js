var path = require("path");
var childProcess = require("child_process");
var _ = require("underscore");

var server = require(path.join(__dirname, "../lib/server"));
var program = require("commander");

var pjson = require("../../../package.json");

module.exports = {
    notifyIfOutdated: function(callback) {
        childProcess.exec("npm outdated stupid-cms", function(err, stdout, stderr) {
            if (stdout.trim() !== "") {
                console.log("There's a new version of Stupid-cms available. You can upgrade to it by running `npm install -g stupid-cms`");
                console.log("[" + stdout + "]");
            }

            return callback();
        });
    },

    serve: function(options) {
        server(options);
    },

    init: function() {
        var self = this;
        var defaultDir = path.join(process.env.HOME, '.stupid-cms');

        program
            .version(pjson.version)
            .usage("[options]")
            .option("-s, --serve", "Serve the current dir as static cms")
            .option("-n --app-name [app]", "The name of the app")
            .option("-d, --dir [dir]", "Path of the static website [currentDir]", ".")
            .option("-p, --port [port]", "PORT number [3000]", "3000")
            .option("--db [dbPath]", "Path for the db content folder")
            .parse(process.argv);

        var sitePath = program.dir || ".";
        console.log(program.appName);

        var options = {
            port: program.port || 3000,
            path: sitePath,
            dbPath: program.db || path.join(sitePath, "stupid-cms", "db"),
            siteName: program.appName
        };

        console.log("Options : " + JSON.stringify(options));

        if (program.serve) {
            self.serve(options);
            return;
        }
    }

};