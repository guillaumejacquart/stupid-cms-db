# Stupid CMS
A stupidly simple CMS to make static sites editable.

## Getting Started
 1. Clone the repository.
 2. Change the config.js in ./bin and set your admin credentials (basic auth only auth)
 3. Put your website static files in ./site
 4. Add the ".editable" class to tags you want to make editable. Only leaves tag are recommended
 5. Install the modules and run :
npm install && npm start

## Roadmap

 - Add image edition (with upload)
 - Add more authentication configurations
 - Transform into express middleware
