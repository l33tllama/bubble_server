
var MongoClient = require('mongodb').MongoClient;
var mongo = require('./MongoConnection.js').Promises();
//var forEach = require('async-foreach');
var async = require('async');
const dataUrl = 'http://epa.tas.gov.au/air/live/epa_tas_latest_particle_data.txt';
const dbUrl = 'mongodb://localhost:27017/airquality';

var dbConnection;
var dbDataToInsert =[undefined,undefined];
var task;

var firstTime = true;
//Set to poll the data every 5 minutes.
const timeSchedule = " */1 * * * *";

var createDbConnection = function(cb) {
	mongo.connect(dbUrl).then(
		function resolve(dbObject) {
			dbConnection = dbObject;
			console.log('Yo!');
			//Start the scheduler to fetch, parse and insert airquality data in to the db
//			schedule.scheduleJob(timeSchedule, requestDataPromise);
			var timestampQuery = {'most_recent' : { $exists: true} };
			
			var array = [];
			
			mongo.findOne(dbConnection, 'timestamps', timestampQuery).then(
				function success(mostRecent) {
					//console.log('Here in findOne');
					//console.log(mostRecent["_id"]);
					
					var readingsQuery = {"timestamp_id" : mostRecent["_id"]};
					mongo.find(dbConnection, 'readings', readingsQuery).then(
						
						function success(cursor) {
							//console.log("Success");
							//console.log(cursor);

							
/*
							async.map(cursor, forEach, function(err, result){
								array.push(result);
							}, function(){
								cb(array);
							});

							forEach(cursor, function(item, index, arr){
								console.log("each", item, index, arr);
								var done = this.async();
								setTimeout(function() {
									array.push(item);
									done();
								}, 500);

								
							}, cb(array));
							*/
							/*
							async.eachSeries(cursor, function(doc, callback){
								array.push(doc);
								callback();
							}, function done(){
								
							}); */
							
							cursor.each(function(err, doc) {
									if(doc == null){
										cb(array);
									}
									array.push(doc);
								}
							);
							//cb(array);
						},
						function fail(result) {
							console.log('Failure');
							console.log(result);
						});
				},
				function failure(value) {
					console.log("Failure: " + value);
				});	
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
//createDbConnection();

module.exports = {getData : createDbConnection}

