

function mongoConnection(mongoClient, connectionUrl,data) {
	var promise = new Promise(
		function(fulfill, reject) {
			mongoClient.connect(connectionUrl,
				function(error, db) {
					console.log(error);
					var collection = db.collection("readings");
				
					collection.insert(data[1],function(error,result){
						if(!error) {
							console.log("Success :"+result.ops.length+" stuff  inserted!");
						} else {
							console.log("Some error was encountered!");
						}
					
						fulfill("Won");
						reject(error);
						db.close();
					});
				}
			);
		}
	);
	return promise;
}



module.exports = mongoConnection;
