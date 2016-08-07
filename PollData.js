/**
* sets a promise to be resolved after a certain time period
* @param {number} interval - Time interval in minutes
* @return {object} promise
*/
function setAsyncTimer(interval) {
	interval = interval*60000
	var promise = new Promise(
		function executor(resolve,reject) {
			setTimeout(
				function() {
					resolve();
				},
				interval
			);			
		}
	);
	return promise;
}

module.exports = setAsyncTimer;