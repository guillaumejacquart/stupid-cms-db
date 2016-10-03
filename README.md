# Stupid CMS
A stupidly simple CMS to make static sites editable without compromising your original static files.


![Codeship](https://codeship.com/projects/77c806e0-42bd-0134-297e-6295fca7620e/status?branch=master "Codeship")
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b5a95265fda942e6be4e5ec1ea94a044)](https://www.codacy.com/app/guillaume-jacquart/stupid-cms-db?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=guillaumejacquart/stupid-cms-db&amp;utm_campaign=Badge_Grade)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)



## Demo
Live demo : [Stupid-CMS demo](http://stupid-cms.dynalias.org/)
To edit the content, go to : [http://stupid-cms.dynalias.org/cms/login](http://stupid-cms.dynalias.org/cms/login) and use the credentials :
* login : login
* password : password

## Getting Started
There is two ways you can get started with Stupid-CMS : from the CLI or using the express middleware

### Using the cli to serve your site as editable

 1. Install stupid-cms globally.
 
```
npm install -g stupid-cms
```

 2. Go to your static site folder and serve using stupid-cms :
 
```
stupid-cms -s --port 3000 [--dir SITEPATH (default to current dir)]
```

 3. Go to 'http://localhost:3000/cms/login' and enter your credentials to edit the site.

### Using the cli to create standalone nodejs app
 1. Install stupid-cms globally.
 
```
npm install -g stupid-cms
```

 2. Setup a new site :
 
```
stupid-cms setup new_site;
cd new_site;
npm install;
```

 3. Put your website static files in ./site
 4. Add the "data-content" attributes with a unique values to the tags you want to make editable.
 5. Install the modules and run :
npm install & npm start
 6. Go to 'http://localhost:3000/cms/login' and enter your credentials to edit the site.

### Using the middleware
You can add a editable static site to any of your expressjs application using this middleware. Just add one configuration and pass your express app object to the cms :
 ```
var app = express();
...
// This is the path to your website static files
var sitePath = path.join(__dirname, 'site');
cms({
	sitePath: sitePath,
	index: 'index.html'
}, app);
```


Then repeat steps 3 to 6 to edit your content
