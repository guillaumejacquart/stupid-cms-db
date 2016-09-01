var fs = require("fs.extra");
var cheerio = require("cheerio");
var uuid = require("node-uuid");

var db;

function editContent(contentName, pageName, html, attrs, repeatIndex, callback){	
	var handledAttributes;
	if(attrs){
		handledAttributes = attrs.filter(function(a){
			return ["src"].indexOf(a.name) !== -1;
		});
	}
	
	var content = {
		name: contentName,
		page: pageName
	}
	
	db.find({name: contentName, page: pageName}, function (err, docs) {
		if(docs.length){
			if(typeof(repeatIndex) !== "undefined"){
				content.repeats = docs[0].repeats || [];
				var existingRepeat = content.repeats.filter(function(r){ return r.index === repeatIndex });
				if(existingRepeat.length > 0){
					existingRepeat[0].html = html;
				} else {
					content.repeats.push({
						index: repeatIndex,
						html: html,
						attrs: handledAttributes
					});
				}
			} else {				
				content.html = html;
				content.attrs = handledAttributes;
			}
			
			db.update({ name: content.name }, { $set: content }, {}, function (err, numReplaced) {
				callback(err);
			});
		} else {
			if(typeof(repeatIndex) !== "undefined"){
				content.repeats = [{
					index: repeatIndex,
					html: html,
					attrs: handledAttributes
				}];
			} else {				
				content.html = html;
				content.attrs = handledAttributes;
			}
						
			db.insert(content, function (err, newDoc) {
				callback(err);
			});
		}
	});
};

/* POST remove content repeatable. */
function removeRepeatable(contentName, pageName, repeatIndex, callback){
	var content = {
		name: contentName,
		page: pageName
	}
	
	db.find({name: content.name, page: content.page}, function (err, docs) {
		if(docs.length){
			content.repeats = docs[0].repeats || [];
			var indexToDelete;
			var existingRepeat = content.repeats.filter(function(r, eIndex){ 
				if(r.index === repeatIndex){
					indexToDelete = eIndex;
					return true;
				}
				return false;
			});
			if(existingRepeat.length > 0){
				content.repeats.splice(indexToDelete, 1);
				content.repeats.forEach(function(r){
					if(r.index > repeatIndex){
						r.index--;
					}
				});
			}
			
			db.update({ name: content.name }, { $set: content }, {}, function (err, numReplaced) {
				callback(err);
			});
		} 
	});
};

/* POST order content repeatable. */
function orderRepeatable(contentName, pageName, repeatIndex, newRepeatIndex, callback){
	
	var content = {
		name: contentName,
		page: pageName
	}
	
	db.find({name: content.name, page: content.page}, function (err, docs) {
		if(!docs.length){
			callback({
				message: "Content does not exist"
			});
		}
			
		content.repeats = docs[0].repeats || [];
		var indexToDelete;
		var existingRepeat = content.repeats.filter(function(r){ 
			return r.index === repeatIndex;
		});
		var repeatToMove = content.repeats.filter(function(r){ 
			return r.index === newRepeatIndex;
		});
		
		if(existingRepeat.length > 0){
			existingRepeat[0].index = newRepeatIndex;
			if(repeatToMove.length > 0){
				repeatToMove[0].index = repeatIndex;
			}
		}
		
		db.update({ name: content.name }, { $set: content }, {}, function (err, numReplaced) {
			callback(err);
		});
	});
};

/* Change page html to make dom element editable */
function makeElemEditable(selector, filepath, callback){
	fs.access(filepath, fs.F_OK, function(){
		fs.readFile(filepath, "utf8", function(err, data){
			if(!data){
				throw new Error("File does not exist");
			}
			
			$ = cheerio.load(data);
			
			var elem = $(selector);
			if(elem.length === 1){
				var name = uuid.v1();
				elem.attr("data-content", name);
				fs.writeFile(filepath, $.html(), (err) => {
					if (err){
						throw err;
					}
					callback(null, name);
				});
			} else {
				callback({
					message: "The selector is incorrect: " + elem.length + " matches. You must set the editable content manually"
				});
			}
		});	
	});
};

/* Change page html to make dom element not editable */
function destroyElemEditable(id, filepath, callback){
	fs.access(filepath, fs.F_OK, function(){
		fs.readFile(filepath, "utf8", function(err, data){
			if(!data){
				throw new Error("File does not exist");
			}
			
			$ = cheerio.load(data);
			
			var elem = $("[data-content=\"" + id + "\"]");
			if(elem.length === 1){
				var name = uuid.v1();
				elem.removeAttr("data-content");
				fs.writeFile(filepath, $.html(), (err) => {
					if (err) throw err;
					db.remove({ name: id }, {}, function (err, numRemoved) {
						if (err) throw err;
						callback();
					});
				});
			} else {
				throw new Error("Id matches " + elem.length + " elements");
			}
		});	
	});
};

module.exports = function(dbArg){
	db = dbArg;
	
	return {
		editContent,
		removeRepeatable,
		orderRepeatable,
		makeElemEditable,
		destroyElemEditable
	};
};
