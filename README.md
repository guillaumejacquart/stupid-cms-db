# Stupid CMS
A stupidly simple CMS to make static sites editable without compromising your original static files.


![Codeship](https://codeship.com/projects/77c806e0-42bd-0134-297e-6295fca7620e/status?branch=master "Codeship")
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b5a95265fda942e6be4e5ec1ea94a044)](https://www.codacy.com/app/guillaume-jacquart/stupid-cms-db?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=guillaumejacquart/stupid-cms-db&amp;utm_campaign=Badge_Grade)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)



## Demo
Live demo : [Stupid-CMS demo](https://test-stupid-cms.herokuapp.com/)
To edit the content, go to : [https://test-stupid-cms.herokuapp.com/cms/login](https://test-stupid-cms.herokuapp.com/cms/login) and use the credentials :
* login : test
* password : test

## Getting Started
There is two ways you can get started with Stupid-CMS : from the CLI or using the express middleware

### Using the cli to serve your site as editable

 1. Install stupid-cms globally.
 
```
npm install -g stupid-cms
```

 2. Go to your static site folder and serve using stupid-cms :
 
```
stupid-cms -n <your_app_name> -s --port 3000 [--dir SITEPATH (default to current dir)]
```

 3. Go to 'http://localhost:3000/cms/login' and enter your credentials to edit the site.

### Using the middleware
You can add a editable static site to any of your expressjs application using this middleware. Just add one configuration and pass your express app object to the cms :
 ```
var app = express();
var cms = require("stupid-cms");
...
// This is the path to your website static files
var sitePath = path.join(__dirname, 'sit
	sitePath: sitePath,
	siteName: 'test_app',
	index: 'index.html'
}, app);
```

Then repeat steps 3
