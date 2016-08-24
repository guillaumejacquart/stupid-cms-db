var Path = require("path");
var ChildProcess = require("child_process");
var _ = require("underscore");

var ProjectCreator = require(Path.join(__dirname, "../lib/project_creator"));
var Server = require(Path.join(__dirname, "../lib/server"));
var program = require('commander');
 
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

	setup: function(dir) {
		var self = this;

		self.notifyIfOutdated(function() {
			return ProjectCreator.createStructure(dir);
		});
	},
	
	serve: function(options){
		Server(options);
    },

	init: function() {
		var self = this;
		
		program
		  .version('0.0.1')
		  .command('serve', 'serve static website')
		  .option('-d, --dir [dir]', 'Path of the static website [currentDir]', '.')
		  .option('-u, --username [username]', 'Editor username')
		  .option('-p, --password [password]', 'Add the specified type of cheese', 'marble')
		  .option('-P, --port [port]', 'PORT number [3000]', '3000')
		  .action(function(env, optionsArgs){
			var options = {
				port: optionsArgs.port || 3000,
				username: optionsArgs.username || 'login',
				password: optionsArgs.password || 'password',
				path: optionsArgs.dir || '.'
			}
			
			self.serve(options);
		  })
		  .command('setup [dir]', 'setup static site from sample')	
		  .action(function(dir){
			  self.setup(dir);
		  })
		  .parse(process.argv);
	}

};