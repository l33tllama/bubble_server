function parseData(data) {

	var parsedResults = [];
	var promise = new Promise( 
		function(fulfill, reject) {

			var lines = data.split('\n');
			
			console.log()
			for(var line = 0; line < lines.length; line++){
				
				if(line === 1) {
					//Get the last file production timestamp info!
					var currLine = lines[line].split(' ');
					var hours = currLine[5].split(":")[1].slice(0,8);
					var hms = currLine[7].slice(0,6); 
					var timeStamp = hours + hms;
					timeStamp = +timeStamp;
				}
				
				//header text!
				if(line < 9) {
					continue;
				}
			
				var currentLine = lines[line].split(',');
				var stationName = currentLine[0].trim();
				var pm_2_5_value = +currentLine[2];
				var pm_10_value = +currentLine[3];
				
				//An empty line down the bottom
				if (line === (lines.length -1)) {
					break;
				}
				
				var currentStation = {
					'station_name' : stationName,
					'pm_2_5' : pm_2_5_value,
					'pm_10' : pm_10_value
				};
			

				parsedResults.push(currentStation);
			}
			//Return the unique timestamp number
			parsedResults = [timeStamp, parsedResults];
		fulfill(parsedResults);
	}
	);
	console.log("bottom");
	return promise;
}

module.exports = parseData;
