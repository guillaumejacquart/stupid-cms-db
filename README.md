# Stupid CMS Sample app

 3. Open app.js and change your options :
 
   ```
var app = express();
...
var sitePath = path.join(__dirname, 'site');
var archivesPath = path.join(__dirname, 'archives');
cms({
    sitePath: sitePath,
    archivesPath: archivesPath,
    auth: {
    	type: 'basic',
    	username: 'login',
    	password: 'password'
    }, app);
```
 5. Put your website static files in ./site
 6. Add the ".editable" class to tags you want to make editable. Only leaves tag are recommended
 7. Install the modules and run :
npm install & npm start
 8. Go to '/stupid-cms/admin' and enter your credentials to edit the site.