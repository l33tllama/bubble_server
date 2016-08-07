function pollServer(interval) {
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

function pondSurfer(interval) {
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

module.exports