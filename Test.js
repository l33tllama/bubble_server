
var MongoClient = require('mongodb').MongoClient;
var mongo = require('./MongoConnection.js').Promises();
const dataUrl = 'http://epa.tas.gov.au/air/live/epa_tas_latest_particle_data.txt';
const dbUrl = 'mongodb://localhost:27017/airquality';

var dbConnection;
var dbDataToInsert =[undefined,undefined];
var task;

var firstTime = true;
//Set to poll the data every 5 minutes.
const timeSchedule = " */1 * * * *";

var createDbConnection = function() {
	mongo.connect(dbUrl).then(
		function resolve(dbObject) {
			dbConnection = dbObject;

			//Start the scheduler to fetch, parse and insert airquality data in to the db
//			schedule.scheduleJob(timeSchedule, requestDataPromise);
			var query = {'most_recent' : { $exists: true} };
			mongo.findOne(dbConnection, 'timestamps', query).then(
				function success(value) {
					console.log("Success: " + value);
					console.log(value[1]);
				},
				function failure(value) {
					console.log("Failure: " + value);
				}
			);
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

