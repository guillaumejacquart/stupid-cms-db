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
1) Install stupid-cms globally. 

```
npm install -g stupid-cms-db
```

2) Go to your static site folder and serve using stupid-cms : 

```
stupid-cms --port <your_port> --data <data_path> <site_path> (default to current dir)]
```

3) Go to 'http://localhost:3000/cms/login' and enter your credentials to edit the site.

#### Options
```<site_path>``` : the path where your static site is stored
```--port``` : Optional. set the port you want to run the website on (default 3000)
```--data``` : Optional. set the data directory, where the content, users, and uploads will be stored (default to "./<your_website>/.stupid-cms")

### Using the middleware
You can add a editable static site to any of your expressjs application using this middleware. Just add one configuration and pass your express app object to the cms :
 ```
var app = express();
var cms = require("stupid-cms");
...
// This is the path to your website static files
var sitePath = path.join(__dirname, 'sit
	sitePath: <your_site_path>,
	index: 'index.html',
	dataPath: <your_data_path>
}, app);
```

Then repeat steps 3

## User manual
### Make content editable
Right click on any content on your website, then click on the small pencil shaped button on the top right corner to make it editable.

### Use the editor
Once the content is editable, you can use the wysiwyg editor to change the content, insert pictures, and more.
Every changes to make are saved in local storage, and are not lived.

### Publish your changes
Once you validated the changes on your live site, you can use the toolbar on the right side to publish it. Just click on the floppy disk shape button to set your changes live.

### Make content un-editable
On the editor, you can click the "remove editor" button to disable content edition for this element.
