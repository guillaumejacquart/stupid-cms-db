var cheerio = require("cheerio");
var uuid = require("node-uuid");
var bCrypt = require("bcrypt-nodejs");

var userDb;

function findOne(username, callback){
	userDb.findOne({ username: username }, function (err, user) {
		callback(err, user);
	});
}

function hasAny(callback){
	userDb.find({ }, function (err, docs) {
		callback(err, docs && docs.length);
	});
}

function register(newUser, callback){
	// find a user in nedb with provided username
	userDb.findOne({ 'username': newUser.username },function(err, user) {
		// In case of any error return
		if (err){
			console.log('Error in SignUp: '+err);
			return callback(null, err);
		}
		// already exists
		if (user) {
			callback(null, 'User already exists');
		} else {
			newUser.password = createHash(newUser.password);

			// save the user
			userDb.insert(newUser, function(err) {
				if (err){
					console.log('Error in Saving user: '+err);  
					throw err;  
				}
				
				console.log('User Registration succesful');    
				callback(newUser);
			});
		}
	});
}

function validatePassword(user, password){
	return bCrypt.compareSync(password, user.password);
}

// Generates hash using bCrypt
var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

module.exports = function(userDbArgs){
	userDb = userDbArgs;
	
	return {
		findOne,
		hasAny,
		register,
		validatePassword
	};
};
