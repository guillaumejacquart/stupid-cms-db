# Stupid CMS Sample app

 1. Open app.js and change your options :
 
   ```
var app = express();
...
var sitePath = path.join(__dirname, 'site');
var archivesPath = path.join(__dirname, 'archives');
cms({
    sitePath: sitePath,
	index: "index.html"
	}, app);
```
 2. Put your website static files in ./site
 3. Add the data-content attributes with unique values to tags you want to make editable. Only leaves tag are recommended
 4. Install the modules and run :
npm install & npm start
 5. Go to '/cms/login' and create your admin account your credentials to edit the site.