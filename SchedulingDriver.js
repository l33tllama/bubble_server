var MongoClient = require('mongodb').MongoClient;
var schedule = require('node-schedule');
var Promise = require("bluebird");

var mongo = require('./MongoConnection.js').Promises();
var parseData = require('./ParseData.js');
var requestData = require('./RequestData.js');

const dataUrl = 'http://epa.tas.gov.au/air/live/epa_tas_latest_particle_data.txt';
const dbUrl = 'mongodb://localhost:27017/airquality';

var dbConnection;
var dbDataToInsert =[undefined,undefined];
var task;
//Set to poll the data every 5 minutes.
const timeSchedule = " */5 * * * *";

var createDbConnection = function() {
	mongo.connect(dbUrl).then(
		function resolve(dbObject) {
			dbConnection = dbObject;

			
			//Start the scheduler to fetch, parse and insert airquality data in to the db
			schedule.scheduleJob(timeSchedule, requestDataPromise);
		},
		function reject(error) {
			console.log('DB connection error');
			console.log(error);
			
			//Close the scheduler down if it's running
			if(schedule) { schedule.cancel() };
			
			//Attempt to create database connection again in 1 minute in event of failure.
			setTimeout(
				createDbConnection,
				60000
			);	
		}
	);
}

//Start the whole fetch, parse insert rolling!
createDbConnection();

var requestDataPromise= function(){
	requestData(dataUrl).then(
		function resolve(data) {
			console.log(data);
			if( data === null) {
				//Don't proceed further - scheduler will try again next time!
				return;
			} else{
				return parsePromise(data);
			}
		},
		function reject(error) {
			console.log('Error occured when requesting data.');
			console.log(error);
		}
	);	
}

var parsePromise = function(data) {
					
	parseData(data).then(
		function resolve(parsedData) {	
			if (parsedData === null) {
				//scheduler will try again later
				return;
			} else {
				//move parsedData to outer variable scope so future executed promises have access to it.
				dbDataToInsert = parsedData;
				checkTimestampPromise();
			}	
		},
		function reject(error) {
			console.log('Error occured when requesting data.')
			console.log(error);
			return;
		}
	);
}

var checkTimestampPromise = function() {
	//Get most recent data timestamp from the database
	mongo.findOne(dbConnection, 'timestamps', {}).then(
			
		function resolve(latestTimestamp) {
			console.log('In checkTimestampPromise');

			if (latestTimestamp === null) {
				//Something went wrong! Mongodb automatically attempts restarts.
				return;
			}

			if (latestTimestamp['most_recent'].toISOString() === dbDataToInsert[0].toISOString() ) {
				//Go no further - the database is up-to-date! Scheduler will check again next time!
				return;
			}
			console.log('Got to this point');
			//Insert latest data in to database.
			insertTimestampPromise();
		},
		
		function reject(error) {
			console.log('There was a database find error');
			console.log(error);
			return;
		
		}
	);
}
	 
var insertTimestampPromise = function() {

	mongo.insert(dbConnection,'timestamps', {most_recent: dbDataToInsert[0]}).then(
		function resolve(timestampSuccess) {
			if( timestampSuccess['insertedIds']) {
				var foreignKeyId = timestampSuccess['insertedIds'][0];

				//Add the timestamp foreign key to each json object being inserted.
				var formattedData =[];
				
				for(var i=0; i< dbDataToInsert[1].length; i++) {
					currentReading = dbDataToInsert[1][i];
					currentReading['timestamp_id'] = foreignKeyId;
					formattedData.push(currentReading);
				}

				insertAirDataPromise(formattedData);
				
			} else {
				//Something shoddy happened. Try next time.
				return;
			}
		},
		function reject(error) {
			console.log('Error occured when inserting most recent timestamp');			
			console.log(error);
			return;
		}	
	);
}

var insertAirDataPromise = function(airQualData) {
	mongo.insert(dbConnection,'readings', airQualData).then(
		function resolve(airQualSuccess) {
			console.log("Successfully finished operation");
//			console.log("New reading id inserted: " + airQualSuccess['insertedIds']);
			return;
		},
		function reject(error) {
			console.log('Error occured when inserting most recent air quality data');			
			console.log(error);
			return;
		}
	);
}
