# zapp-csv-uploader

## Requirements

* Node version 20.x.x
* npm version 10.x.x
* [NVM install guide](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating) 

## Setup

* Install latest node/npm version using nvm
* Clone the github repo
* Insstall node modules with `npm i` command
* Build the typescript application with `npm run build` command
* Start the application with `npm start` command
* Navigate to http://localhost:3000

## Debugging
The repository contains vscode launch.json file that allows you to run typescript project directly using nodemon binaries with live reloading.

Just hit F5 to start debugging

## Testing
Project contains `api.rest` file that allows you to test standalone APIs. Install [VSCode Rest Client Plugin](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) to use it. Make sure your application is running before making API calls.

## Database & Data
The application uses sqlite database & creates a table (if it does not exists) when you start the application.

`example.csv` file contains some sample data that can be used to load data either by using rest client or the UI.

## Application
The application is using following main modules to implement REST APIs -

* `express` - Web application to implement REST APIs
* `inversify` - Dependency injection tool to manage service instances within the application
* `joi` - Validtion framework to validate API payload
* `multer` - Express middleware to read uploaded files
* `csv-parser` - Parse CSV files
* `sqlite3` - Package to interact with sqlite database.
* `nodemon` - Bedugging tool to provide live reload

## Features

* CSV File upload
* Listing Screen
* Inline edit for editable columns
* Delete record with confirmation

Re-uploading record with same SKU would result in an upsert action.
This will update the existing record with same SKU value.
SKU & Store fields are not editable

#