//Note this function is specific to the parsed data. A more generic one may also be built.
function insertData(db, collectionName, dataList) {

	var promise = Promise(
		function(resolve,reject) {
			var collection = db.collection(collectionName);

			collection.insert(dataList,
				function(error,result) {
					
					if(!error) {
						console.log('Inserted');
						resolve(result);
					}
					else {
						console.log("An error!");
						reject(error);
						db.close();
					}
				}
			);
		}
	);
	return promise;
}

module.exports = insertData;