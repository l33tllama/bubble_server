//Note this function is specific to the parsed data. A more generic one may also be built.
function insertData(db, collectionName, dataList) {
	console.log(dataList);
	
	var promise = Promise(
		function(resolve,reject) {
			var collection = db.collection(collectionName);

			var collection = db.collection('readings');
			collection.insert([{"hi": "bye"}],
				function(error,result) {
					if(!error) {       console.log("Success :"+result.ops.length+" chapters  inserted!");     } else {       console.log("Some error was encountered!");     }
				}		 
			);
			
			db.close();
			
//			collection.insert({"hello" :"bye"},
//				function(error,result) {
//					
//					if(!error) {
//						console.log('Inserted');
//						resolve(result);
//					}
//					else {
//						console.log("An error!");
//						reject(error);
//						db.close();
//					}
//				}
//			);
		}
	);
	return promise;
}

module.exports = insertData;