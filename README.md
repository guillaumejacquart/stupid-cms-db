# Stupid CMS
A stupidly simple CMS to make static sites editable without compromising your original static files.

## Demo
Live demo : [Stupid-CMS demo](http://stupid-cms.dynalias.org/)
To edit the content, go to : [http://stupid-cms.dynalias.org/cms/login](http://stupid-cms.dynalias.org/cms/login) and use the credentials :
* login : login
* password : password

## Getting Started
There is two ways you can get started with Stupid-CMS : from the CLI or using the express middleware
### From the sample
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

 3. Open app.js to change your options :
 
```
var app = express();
...
var sitePath = path.join(__dirname, 'site');
cms({
	sitePath: sitePath,
	index: 'index.html',
	auth: {
		type: 'basic',
		username: 'login',
		password: 'password'
	}
}, app);
```

 4. Put your website static files in ./site
 5. Add the "cms-content" attributes with a unique value.
 6. Install the modules and run :
npm install & npm start
 7. Go to 'http://localhost:3000/cms/login' and enter your credentials to edit the site.

### Using the middleware
You can add a editable static site to any of your expressjs application using this middleware. Just add one configuration and pass your express app object to the cms :
 ```
var app = express();
...
// This is the path to your website static files
var sitePath = path.join(__dirname, 'site');
cms({
	sitePath: sitePath,
	index: 'index.html',
	auth: {
		type: 'basic',
		username: 'login',
		password: 'password'
	}
}, app);
```


Then repeat steps 4 to 8 to edit your content


Currently only basic auth is supported. More to come...
## Roadmap

 - Add image edition (with upload)
 - Add more authentication configurations
