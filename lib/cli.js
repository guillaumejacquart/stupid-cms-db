var Path = require("path");
var ChildProcess = require("child_process");
var _ = require("underscore");

var ProjectCreator = require(Path.join(__dirname, "../lib/project_creator"));

module.exports = {
	notifyIfOutdated: function(callback) {
		ChildProcess.exec("npm outdated stupid-cms", function(err, stdout, stderr) {
			if (stdout.trim() !== "") {
				console.log("There's a new version of Stupid-cms available. You can upgrade to it by running `npm install -g stupid-cms`");
				console.log("[" + stdout + "]");
			}

			return callback();
		});
	},

	setup: function(args) {
		var self = this;

		self.notifyIfOutdated(function() {
			return ProjectCreator.createStructure(args.pop());
		});
	},

	help: function() {
		var self = this;

		self.notifyIfOutdated(function() {
			console.log("Usage: stupid-cms COMMAND [ARGS]\n");
			console.log("You can use following commands:");
			console.log("  setup    - create a new site structure in the given path. (stupid-cms setup)");
		});
	},

	init: function(args) {
		var self = this;

		var commands = ["setup"];

		var command = args.shift();

		if(_.include(commands, command)){
			return self[command](args);
		} else {
			return self["help"]();
		}
	}

};