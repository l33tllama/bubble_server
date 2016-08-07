var express = require('express');
var app = express();
var path = require('path');
var mongoClient = require('mongodb').MongoClient;

app.use(express.static('css/layouts'));
app.use(express.static('img'))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/data', function (req, res) {
  
	
	res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('var mongoClient = require('mongodb').MongoClient;Example app listening on port 3000!');
});
