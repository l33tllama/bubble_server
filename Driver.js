var mongoClient = require('mongodb').MongoClient;
var mongoConnection = require('./MongoConnection');
var insertData = require('./InsertData.js');
var requestData = require('./RequestData.js');
var parseData = require('./ParseData.js');
var pollData = require('./PollData.js');
var request = require('request');

//make request variables
var requestUrl = 'http://epa.tas.gov.au/air/live/epa_tas_latest_particle_data.txt';
var dbUrl = 'mongodb://localhost:27017/airquality';

function processRequests() {
	pollData(10).then(
		function() {
			return requestData(requestUrl);
		},
		function(error) {
			console.log('Error polling data.');
			db.close();
		}
	).then(
		function(requestedData) {
			console.log("About to parse.");
			return parseData(requestedData);
		},
		function(error) {
			console.log('Error requesting data.');
			db.close();
		}
	).then(
		function(parsedData) {
			return mongoConnection(mongoClient, dbUrl,parsedData);
		},
		function(error) {
			console.log(error);
		}
	).then(
		function() {
			console.log("I am at the end");
			return processRequests();
		},
		function(error) {
			console.log(error);
		}
	);
}

processRequests();
//C:\mongodb\bin\mongoimport.exe --db airquality --collection postcodes --type csv --//headerline --file test1.csv
