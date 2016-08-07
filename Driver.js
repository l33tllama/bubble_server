var MongoClient = require('mongodb').MongoClient;
var schedule = require('node-schedule');

var mongo = require('./MongoConnection.js').Promises();
var setAsyncTimer = require('./SetAsyncTimer.js');
var requestData = require('./RequestData.js');
var parseData = require('./ParseData.js');


const dbUrl = 'mongodb://localhost:27017/test';
const dataUrl = 'http://epa.tas.gov.au/air/live/epa_tas_latest_particle_data.txt';

var dbConnection;
var dbDataToInsert =[undefined,undefined];

//create database connection
var start = function() {
	mongo.connect(dbUrl).then(
		function resolve(dbObject) {
			dbConnection = dbObject;
			
			//dbConnection is open and alive for use!
			asyncProcessingChain();

		},
		function reject(error) {
			console.log('DB connection error');
			console.log(error);
		}
	);
}

var asyncProcessingChain = function() {
	setAsyncTimer(0.1).then(
		function resolve() {
			return requestData(dataUrl);
		},
		function reject(error) {
			console.log('Error occured when calling setAsyncTimer.')
			console.log(error);
		}
	).then(
		function resolve(data) {
			return parseData(data);
		},
		function reject(error) {
			console.log('Error occured when requesting data.');
			console.log(error);
		}	
	).then(
		function resolve(parsedData) {
			dbDataToInsert = parsedData;
			return mongo.findOne(dbConnection, 'timestamps', {});
		},
		function reject(error) {
			console.log('Error occured when parsing data.')
			console.log(error);
		}	
	).then(
		function resolve(newestTimestamp) {
			console.log(newestTimestamp);
			if (newestTimestamp == null) {
				newestTimestamp = {'most_recent' : new Date(1970,0,0)};
			}

			if (newestTimestamp['most_recent'].toISOString() === dbDataToInsert[0].toISOString() ) {
				return Promise.reject('DB_UP_TO_DATE');
			}
			
			return mongo.insert(dbConnection,'timestamps', {most_recent: dbDataToInsert[0]});
		},
		function reject(error) {
			console.log('Error occured when getting most recent timestamp');
			console.log(error);
		}	
	).then(
		function resolve(timestampSuccess) {

			if(timestampSuccess['insertedIds']) {
				var foreignKeyId = timestampSuccess['insertedIds'][0];

				//Add the timestamp foreign key to each json object being inserted.
				var formattedData =[];
				
				for(var i=0; i< dbDataToInsert[1].length; i++) {
					currentReading = dbDataToInsert[1][i];
					currentReading['timestamp_id'] = foreignKeyId;
					formattedData.push(currentReading);
				}

				return mongo.insert(dbConnection,'readings', formattedData);
				
			} else {
				return Promise.reject('No timestamp success Id returned');
			}
		},
		function reject(error) {
			console.log('Error occured when getting most recent timestamp');			
			console.log(error);
		}	
	).then(
		function resolve(successObject) {
			console.log("Database transactions finished!");
			dbConnection.close();
		},
		function reject(error) {
			console.log('Error occured when inserting reading data');
			console.log(error);
		}
	);
}

start();






