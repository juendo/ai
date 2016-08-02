var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = require('./password');

var queries = require('./queries');

var findDocuments = function(game, db, callback) {

  db.collection(game + '-wins').aggregate([]).toArray(function(err, docs) {
    assert.equal(err, null);
    callback(docs);
  });
}


module.exports = function(game, callback) {
  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log(err);
    } else {
      findDocuments(game, db, function(docs) {
        db.close();
        callback(docs);
      });
    }
  });
}