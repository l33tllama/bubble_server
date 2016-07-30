var request = require('request');

function requestData(requestUrl) {
	promise = new Promise( 
		function(fulfill, reject) {
			request(requestUrl,	
				function(error, response, body) {
					if (!error && response.statusCode == 200) {
						fulfill(body);		
					} else {
						reject();
					}
				}
			);
	});
	return promise;
}


module.exports = requestData;