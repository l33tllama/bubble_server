function pollData(interval) {
	interval = interval*1000
	var promise = new Promise(
		function(fulfill,reject) {
			setTimeout(
				function() {
					fulfill();
				},
				interval
			);			
		}
	);
	return promise;
}

module.exports = pollData;