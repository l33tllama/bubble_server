/* Index.js */
var express = require('express');
var app = express();
var server = require('http').Server(app);
var path = require('path');
var mongoClient = require('mongodb').MongoClient;
var io = require('socket.io')(server);
var airData = require('./Test');
var LineByLineReader = require('line-by-line');
var geolib = require('geolib');
lr = new LineByLineReader('tas_postcodes.txt');
var machineReady = false;

// https://www.airnow.gov/
function getQualityRating(ppm){
	// healthy, no risk
	if(ppm > -100 & ppm < 50){
		return 0;
	} // only harmfult to small number of people 
	else if (ppm > 51 && ppm < 100){
		return 1;
	} // unsafe for sensitive grpups
	else if (ppm > 101 && ppm < 150){
		return 2;
	} // unhealthy
	else if(ppm > 151 && ppm < 200){
		return 3;
	} // very bad
	else if(ppm > 201 && ppm < 300){
		return 4;
	} // hazardous
	else if (ppm > 301 && ppm < 500){
		return 5;
	}
}

var postcodes = [];

lr.on('line', function(line){
	var lineEls = line.split(',');
	var _postcode = lineEls[0].replace(/'/g, "");
	var loc = lineEls[1];
	var lat = lineEls[3];
	var lon = lineEls[4];
	postcodes.push({postcode: _postcode, 
		location : loc, 
		latitude : lat,
		longitude : lon});
});

lr.on('end', function(){
	for (var i = postcodes.length - 1; i >= 0; i--) {
		//console.log(postcodes[i]);
	}
	//getQualityClosesToPostcode('7000');
});

app.use(express.static('css/layouts'));
app.use(express.static('img'));

var viewsPath = "/views/";
var serverPort = 80;

server.listen(serverPort, function(){
	console.log("Server listening on port " + serverPort);
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + viewsPath +'/index.html'));
});


function getStationClosesToLatLon(lat, lon, cb){
	console.log("Getting staiton closes to lat" + lat + " lon" + lon);
	
	airData.getData(function(results){
		var shortestdist = 99999999;
		var closestStationData = {};
		for (var i = 0; i < results.length; i++) {
			var ilat = results[i].lat;
			var ilon = results[i].lon;

			var dist = geolib.getDistance({latitude : lat, longitude: lon},
										{latitude: ilat, longitude: ilon});
			/*
			_id: 57ac9fd5aeee8836dc775bb0,
			  station_name: 'GV',
			  pm_2_5: -99,
			  pm_10: -99,
			  lat: -99,
			  lon: -99,
			  */

			//console.log("This dist: " + dist);
			if(dist < shortestdist){
				shortestdist = dist;
				closestStationData = {	station : results[i].station_name,
										pm_2_5 : results[i].pm_2_5,
										pm_10 : results[i].pm_10,
										lat : results[i].lat,
										lon : results[i].lon};
			}
			//console.log(results[i]);
			var station = results[i].station;
			var pm_2_5 = results[i].pm_2_5;
			var pm_10 = results[i].pm_10;
		}
		console.log("Shortest dist " + shortestdist + " at station " + closestStationData.station);
		cb(closestStationData);	
	});
	
}


function getPostcodeLatLon(postcode, cb){
	var returned = false;
	for (var i = 0; i < postcodes.length; i++) {
		var comp_res = postcode.localeCompare(postcodes[i].postcode);
		//console.log(comp_res);
		//console.log(postcode + " == " + postcodes[i].postcode);
		if(comp_res == 0){
			var lat = postcodes[i].latitude;
			var lon = postcodes[i].longitude;
			console.log("Postcode " + postcode + " loc: " + postcodes[i].location);
			returned = true;
			cb(lat, lon);
			break;
		}
	}
	if(!returned){
		cb(9999,9999);	
	}
	
}

app.get('/get_airquality', function (req, res) {
	// if correct params set
	console.log("quality reqest : ")
	console.log(req.query);

	if(req.query.postcode != null){
		getPostcodeLatLon(req.query.postcode, function(lat, lon){
			getStationClosesToLatLon(lat, lon, function(stationData){
				stationData.requestPostcode = req.query.postcode;
				// send to machine first
				if(machineReady){
					io.emit('bubble-request', stationData);
				} else {
					res.send(JSON.stringify(stationData));	
				}
				
			});
		})
	} else if (req.query.positionLat != null && req.query.positionLon != null){
		var lat = req.params.positionLat;
		var lon = req.params.positionLon;
		getStationClosesToLatLon( lat, lon, function(stationData){
			//res.send(JSON.stringify(stationData));
		});
	}	
});



io.on('connection', function (socket) {
	connected = true;
  	console.log("Connection!");

  	socket.on('machine-status', function(data){
  		console.log("Machine is ready? " + data);
  		machineReady = data;
	});
});

io.on('disconnect', function(){
	connected = false;
});


