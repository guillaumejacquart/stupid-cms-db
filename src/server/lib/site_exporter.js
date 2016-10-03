var express = require("express");
var path = require("path");
var fs = require("fs-extra");
var cheerio = require("cheerio");
var uuid = require('node-uuid');
var copydir = require('copy-dir');
var async = require('async');
var EasyZip = require('easy-zip').EasyZip;

var dataDb,
	sitePath,
	exports = path.join(__dirname, "../exports");

function exportSite(exportCallback) {
	var new_folder = path.join(exports, uuid.v4());
			
	copydir(sitePath, new_folder, function(err) {
		fs.readdir(new_folder, function(err, files){
			console.log(files);			
			var list = files.filter(function(l){
				return l.endsWith('.html');
			});
				
			dataDb.find({ page: { $in: list } }, function (err, docs) {
				
				async.filter(docs, function(doc, callback) {					
					var page = doc.page;
					
					var filepath = path.join(new_folder, page);
					fs.readFile(filepath, "utf8", function(err, data){					
						$ = cheerio.load(data);					
						
						if(doc.contents && doc.contents instanceof Array){
							doc.contents.forEach(function(d){
								var elem = $("[data-content=\"" + d.name + "\"]");
								if(elem.attr("data-repeatable") === "true"){
									if(!d.repeats){
										return;
									}
									
									d.repeats.sort(function(a, b){
										return a.repeatIndex === b.repeatIndex ? 0 : a.repeatIndex < b.repeatIndex ? -1 : 1;
									}).forEach(function(c) {										
										if(c.repeatIndex === 0){
											elem.html(c.innerHtml);
										} else {
											var newEl = elem.clone().html(c.innerHtml);
											var alreadyCreated = elem.siblings("[data-repeatable]");
											if(alreadyCreated.length){
												alreadyCreated.last().after(newEl);
											} else {
												elem.after(newEl);
											}
										}
									});
								} else {
									elem.html(d.innerHtml);
									if(d.attrs){
										d.attrs.forEach(function(a){
											if(a.name == "src"){
												elem.attr(a.name, a.value);
											}
										});
									}
								}
							});
						}
						
						fs.writeFile (filepath, $.html(), function(err) {
							handledHtml++;							
							if (err) throw err;							
							callback(null);
						});
					});
				}, function(err, results){
					generateZip(new_folder, exportCallback);
				});
			});
		});
	});	
};

function generateZip(folder, callback){
	console.log('html treatment in over, generating zip');
	
	var exportFile = path.join(exports, uuid.v4()) + '.zip';		
	var zip = new EasyZip();
	
	zip.zipFolder(folder,function(){
		zip.writeToFile(exportFile);
		
		fs.remove(folder, function (err) {
			if (err) throw err;

			console.log('Export success!')
			callback(exportFile);
		});
	});
}


module.exports = function(options) {	
	dataDb = options.dataDb;
	sitePath = options.sitePath;
	
	return {
		exportSite
	};
};
