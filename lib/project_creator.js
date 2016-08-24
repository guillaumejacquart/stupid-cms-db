var Fs = require("fs");
var Os = require("os");
var Path = require("path");
var ChildProcess = require("child_process");

module.exports = {

	createStructure: function(dir_path) {
		var self = this;

		var template_path = Path.join(__dirname, '../sample');

		var createSiteDirectory = function(site_dir_path, callback) {
			Fs.stat(site_dir_path, function(err, stat) {
				if (err || !stat.isDirectory()) {
					return Fs.mkdir(site_dir_path, callback);
				} else {
					return callback(null, site_dir_path);
				}
			});
		};

		var createSiteStructure = function(destination_path, source_path) {
			var copy_command;

			if (Os.platform() === "win32") {
				copy_command = "ROBOCOPY " + source_path + " " + destination_path + " *.* /E";
			} else {
				copy_command = "cp -r " + source_path + "/ " + destination_path + "/";
			}

			console.log('Creating new project ...');
			ChildProcess.exec(copy_command, function(err, stdout, stderr) {
				console.log('Project created. Initializing modules ...');
				if (err && Os.platform() === "win32" && err.code <= 3) {
				} else if(err) {
					throw err;
				}
				
				process.chdir(Path.basename(destination_path));
				ChildProcess.exec("npm install", function(err, stdout, stderr) {
					if(err){
						console.log(err);
					}
					if(stderr){
						console.log(stderr);
					}
					if(stdout){
						console.log(stdout);
					}
					console.log("Created a new site in " + destination_path);
					console.log("To get started, run: cd " + destination_path + "; npm install; npm start");
				});
			});
		};
		
		if(!dir_path){
			console.log('The PATH argument is missing !');
			return;
		}

		if (dir_path && dir_path !== ".") {
			createSiteDirectory(dir_path, function(err) {
				if (err) {
					console.log("Failed to create the site in " + dir_path);
					return false;
				}
				return createSiteStructure(dir_path, template_path);
			});
		} else {
			createSiteStructure(process.cwd(), template_path);
		}
	}

};