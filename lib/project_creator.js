var Fs = require("fs");
var Os = require("os");
var Path = require("path");
var ChildProcess = require("child_process");

module.exports = {

	createStructure: function(dirPath) {
		var self = this;

		var templatePath = Path.join(__dirname, "../project_dir");

		var createSiteDirectory = function(siteDirPath, callback) {
			Fs.stat(siteDirPath, function(err, stat) {
				if (err || !stat.isDirectory()) {
					return Fs.mkdir(siteDirPath, callback);
				} else {
					return callback(null, siteDirPath);
				}
			});
		};

		var createSiteStructure = function(destinationPath, sourcePath) {
			var copyCommand;

			if (Os.platform() === "win32") {
				copyCommand = "ROBOCOPY " + sourcePath + " " + destinationPath + " *.* /E";
			} else {
				copyCommand = "cp -r " + sourcePath + "/ " + destinationPath + "/";
			}

			console.log("Creating new project ...");
			ChildProcess.exec(copyCommand, function(err, stdout, stderr) {
				console.log("Project created. Initializing modules ...");
				if (err && Os.platform() === "win32" && err.code <= 3) {
				} else if(err) {
					throw err;
				}
				
				process.chdir(Path.basename(destinationPath));
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
					console.log("Created a new site in " + destinationPath);
					console.log("To get started, run: cd " + destinationPath + "; npm install; npm start");
				});
			});
		};
		
		if(!dirPath){
			console.log("The PATH argument is missing !");
			return;
		}

		if (dirPath && dirPath !== ".") {
			createSiteDirectory(dirPath, function(err) {
				if (err) {
					console.log("Failed to create the site in " + dirPath);
					return false;
				}
				return createSiteStructure(dirPath, templatePath);
			});
		} else {
			createSiteStructure(process.cwd(), templatePath);
		}
	}

};