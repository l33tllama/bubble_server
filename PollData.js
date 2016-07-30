function pollData() {

	var promise = new Promise(
		function(fulfill,reject) {
			setTimeout(
				function() {
					fulfill();
				},

				0
			);			
		}
	);
	return promise;
}

module.exports = pollData;