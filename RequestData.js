var request = require('request');

function requestData(requestUrl) {
	promise = new Promise( 
		function executor(resolve, reject) {
			request(requestUrl,	
				function(error, response, body) {
					resolve(body);
					reject(error);
				}
			);
		}
	);
	return promise;
}

module.exports = requestData;