function parseData(data) {

	var parsedResults = [];
	var promise = new Promise( 
		function(fulfill, reject) {

			var lines = data.split('\n');
			

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
			
			//Process integer timeStamp in to a javascript Date object.
			var temp = timeStamp.toString();
			var year = +temp.slice(0,4);
			var month = +temp.slice(4,6)-1;
			var day = +temp.slice(6,8);
			var hour = +temp.slice(8,10);
			var min = +temp.slice(10,12);
			var sec = +temp.slice(12,14);
			
			timeStamp = new Date(year,month,day,hour,min,sec);
			//Force server to record the timestamp as correct UTC time
			timeStamp.setHours(timeStamp.getHours() - 14);

			//Return the unique timestamp number
			parsedResults = [timeStamp, parsedResults];
		fulfill(parsedResults);
	}
	);

	return promise;
}

module.exports = parseData;
