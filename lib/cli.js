var Path = require("path");
var ChildProcess = require("child_process");
var _ = require("underscore");

var ProjectCreator = require(Path.join(__dirname, "../lib/project_creator"));
var Server = require(Path.join(__dirname, "../lib/server"));
var program = require('commander');

var pjson = require('../package.json');

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
		  .version(pjson.version)
		  .usage('[options]')
		  .option('-s, --serve', 'Serve the current dir as static cms')
		  .option('-S, --setup', 'Path to setup the site')
		  .option('-d, --dir [dir]', 'Path of the static website [currentDir]', '.')
		  .option('-u, --username [username]', 'Editor username', 'username')
		  .option('-p, --password [password]', 'Editor password', 'password')
		  .option('-P, --port [port]', 'PORT number [3000]', '3000')
		  .option('--db [dbPath]', 'Path for the db content file')
		  .parse(process.argv);
		  
		  var options = {
			port: program.port || 3000,
			username: program.username || 'login',
			password: program.password || 'password',
			path: program.dir || '.',
			dbPath: program.db || Path.join((program.dir || '.'), 'db.data')
		  }
		  
		  console.log(options);
		  
		  if(program.serve){			  
			self.serve(options);
			return;
		  }
		  
		  if(program.setup){
			self.setup(options.path);
			return;
		  }
	}

};