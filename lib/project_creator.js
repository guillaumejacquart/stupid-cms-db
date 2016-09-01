var Fs = require("fs");
var Os = require("os");
var Path = require("path");
var ChildProcess = require("child_process");

module.exports = {

	createStructure: function(dirPath) {
		var self = this;

		var template_path = Path.join(__dirname, '../sample');

		var createSiteDirectory = function(site_dirPath, callback) {
			Fs.stat(site_dirPath, function(err, stat) {
				if (err || !stat.isDirectory()) {
					return Fs.mkdir(site_dirPath, callback);
				} else {
					return callback(null, site_dirPath);
				}
			});
		};

		var createSiteStructure = function(destination_path, source_path) {
			var copyCommand;

			if (Os.platform() === "win32") {
				copyCommand = "ROBOCOPY " + source_path + " " + destination_path + " *.* /E";
			} else {
				copyCommand = "cp -r " + source_path + "/ " + destination_path + "/";
			}

			console.log('Creating new project ...');
			ChildProcess.exec(copyCommand, function(err, stdout, stderr) {
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
		
		if(!dirPath){
			console.log('The PATH argument is missing !');
			return;
		}

		if (dirPath && dirPath !== ".") {
			createSiteDirectory(dirPath, function(err) {
				if (err) {
					console.log("Failed to create the site in " + dirPath);
					return false;
				}
				return createSiteStructure(dirPath, template_path);
			});
		} else {
			createSiteStructure(process.cwd(), template_path);
		}
	}

};