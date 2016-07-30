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


//Keep the connection alive and available!
mongoConnection(mongoClient, dbUrl).then(
	function(db) {

		
		pollData().then(
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

				return insertData(db, 'readings', parsedData[1]);
			},
			function(error) {
				console.log(error);
			}
		).then(
			function() {
				console.log("Done");
			}
		);		

	},
	function(error) {
		console.log(error);
	}
);





		
//.then(
//		function(parsedData) {

//			return mongoConnection(mongoClient, dbUrl).then(
//				function(db) {
//					console.log(parsedData[1]);
//					collectionName = "readings";
//					return insertData(db,collectionName, parsedData[1]);
//				},
//				function(error) {
//					console.log('Database connection error');
//				}
//			);
//
//		},
//		function(error) {
//			console.log("Failed to parse data")
//		}
//	);


//requestData(requestUrl).then(
//	function(data) {
////		console.log(data);
//		console.log('Got it');
//		return parseData(data);
//	}
//).then(
//	function(data) {
//		console.log('yay');
//		console.log(data);
//		return pollData();
//	}
//);

//pollData()
//	.then(
//		requestData
//	)
//	.then(
//		parseData
//	);

