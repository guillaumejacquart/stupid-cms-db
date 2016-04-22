# Stupid CMS
A stupidly simple CMS to make static sites editable.

## Getting Started
There is two ways you can get started with Stupid-CMS : from the sample in this repository or using the express middleware
### From the sample
 1. Clone the repository.
 2. Go to sample/
 3. Open app.js to change your options :
 
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

### Using the middleware
You can add a editable static site to any of your expressjs application using this middleware. Just add one configuration and pass your express app object to the cms :
 ```
var app = express();
...
// This is the path to your website static files
var sitePath = path.join(__dirname, 'site');
// This is the path to the archives for backups (optional)
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
Currently only basic auth is supported. More to come...
## Roadmap

 - Add image edition (with upload)
 - Add more authentication configurations
