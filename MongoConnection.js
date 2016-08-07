
var MongoClient = require('mongodb').MongoClient;

var Mongo = {
	
	Promises : function() {
		
		/**
		 *	Create a mongodb database collection.
		 *	@param {string} dbUrl - The database url.
		 *	@return {object} Promise
		 */
		var connect = function(dbUrl) {
			var prom = new Promise(
				function executor(resolve, reject) {
					MongoClient.connect('mongodb://localhost:27017/myproject', function(err, db) {
						resolve(db);
						reject(err);
					});
				}
			);
			return prom;
		},

		/**
		 *	Close a mongodb database connection.
		 *	@param {object} dbObject - Object representing database connection.
		 *	@return {object} Promise
		 */
		close = function(dbObject) {
			var prom = new Promise(
				function executor(resolve, reject) {
					dbObject.close(
						function(error) {
							reject(error);
							resolve();
						}
					);
				}	
			);
			return prom;
		},
		
		//CRUD Operations
		//---------------
		
		/**
		 *	Insert json objects in to specified collection in specified database 
		 *	@param {object} dbObject - Object representing database connection.
		 *	@param {string} collectionName - Name of the collection in the database.
		 *	@param {object} jsonData - Name of the collection in the database.
		 *	@return {object} Promise
		 */		
		insert = function(dbObject, collectionName, jsonData) {
			var prom = new Promise(
				function executor(resolve, reject) {
					var collection = dbObject.collection(collectionName);
					
					collection.insert(jsonData, function(error,result) {
						resolve(result);
						reject(error);
					});
				}
			);
			return prom;
		},

		/**
		 *	Get the first record from the specified collection 
		 *	@param {object} dbObject - Object representing database connection.
		 *	@param {string} collectionName - Name of the collection in the database.
		 *	@param {object} queryObject - Collection you are querying in the database.
		 *  @param {array} argsArray - List of extra arguments for findOne function
		 *	@return {object} Promise
		 */		
		findOne = function(dbObject, collectionName, queryObject) {
			var prom = new Promise(
				function executor(resolve, reject) {
					var collection = dbObject.collection(collectionName);
					collection.findOne(queryObject,{sort: [['_id', -1]]},
					
					function(error,result) {
						resolve(result);
						reject(error);
					}				  
					);
				}
			);
			return prom;
		};
		
		return {
			connect: connect,
			close: close,
			insert: insert,
			findOne: findOne
		};

	} //Promises
	
} //Mongo

module.exports = Mongo;