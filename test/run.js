var supertest = require('supertest');
var app = require('../sample/app.js');
var test = require('tape');

test('running test', function (t) {
	supertest(app)
	.get("/")
	.expect(200)
	.end(function(req, res){
		t.end();
	});
});