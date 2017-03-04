#!/usr/bin/env node

var path = require("path");
var cli = require(path.join(__dirname,"../dist/server/lib/cli.js"));
cli.init();
