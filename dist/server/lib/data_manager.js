var fs = require("fs-extra");
var cheerio = require("cheerio");
var uuid = require("node-uuid");

var dataDb;

function editPageContents(contents, page, callback){	
	var content = {
		lastUpdatedAt: new Date(),
		contents: contents
	};
	
	dataDb.update({ page: page }, { $set: content }, { upsert: true }, function (err, numReplaced) {
		callback(err);
	});
};

function getPage(page, callback){
	dataDb.find({ page: page }, function (err, docs) {	
		if(!docs.length){
			callback({
				message: "Page does not exist"
			});
			return;
		}
		if(err){
			throw err;
		}
		
		callback(docs[0]);
	});
}

function getMetadata(page, callback){
	dataDb.find({ page: page }, function (err, docs) {	
		if(!docs.length || !docs[0].metadata){
			callback({
				message: "Metadata does not exist"
			});
			return;
		}
		if(err){
			throw err;
		}
		
		callback(docs[0].metadata);
	});
}

function saveMetadata(metadata, page, callback){	
	dataDb.update({ page: page }, { $set: { metadata: metadata } }, function (err, numReplaced) {	
		callback(err);
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
					if (err) {
						throw err;
					}
					dataDb.remove({ name: id }, {}, function (err, numRemoved) {
						if (err) {
							throw err;
						}
						callback();
					});
				});
			} else {
				throw new Error("Id matches " + elem.length + " elements");
			}
		});	
	});
};

module.exports = function(dataDbArg){
	dataDb = dataDbArg;
	
	return {
		getPage,
		editPageContents,
		makeElemEditable,
		destroyElemEditable,
		getMetadata,
		saveMetadata
	};
};
