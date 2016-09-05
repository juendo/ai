var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
if (process.env.DB_PASS) {
  console.log('db password set');
  var url = process.env.DB_PASS
} else {
  console.log('db password not set');
  var url = require('./password');
}

var logBase = require('../ai/logBase');

var queries = require('./queries');

var findDocuments = function(db, callback) {
  // Get the documents collection
  var moves = db.collection('Moves');
  // Find some documents

  // remove undesired names
  //moves.remove(queries.delete_names);
  //db.collection('glory-to-rome-wins').drop();
  db.collection('glory-to-rome-games').aggregate([
  
  {
    $group: {
      _id: '$room',
      players: {
        $addToSet: '$user'
  
      },
      winning: {
        $addToSet: {
          $cond: ['$winning', '$user', '']
        }
      }
    }
  },
    {
      $match: {
        'players': { $all: [ "Hendo" , "Delargsson" ] }
      }
    }
     
      
    ]).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records")
      

      console.log(docs);

  });
  
}

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected succesfully to server");

  findDocuments(db, function() {
      db.close();
  });
});