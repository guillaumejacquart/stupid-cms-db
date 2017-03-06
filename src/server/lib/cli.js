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
            .usage("[options] <web_dir>")
            .option("-p, --port [port]", "PORT number [3000]")
            .option("-d, --data [data]", "Path for the data (users, content, uploads) folder")
            .parse(process.argv);

        var sitePath = path.join(process.cwd(), program.args[0] || ".");

        var options = {
            port: program.port || process.env.PORT || 3000,
            sitePath: sitePath,
            dataPath: program.data
        };

        console.log("Options : " + JSON.stringify(options));

        self.serve(options);
        return;
    }

};