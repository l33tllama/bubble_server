

function mongoConnection(mongoClient, connectionUrl) {
	var promise = new Promise(
		function(fulfill, reject) {
			mongoClient.connect(connectionUrl,
				function(error, db) {
					fulfill(db);
					reject(error);
				}
			);
		}
	);
	return promise;
}



module.exports = mongoConnection;
