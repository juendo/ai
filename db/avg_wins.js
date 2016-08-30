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

Math.log = (function() {
  var log = Math.log;
  return function(n, base) {
    return log(n)/(base ? log(base) : 1);
  };
})();

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
        _id: {
          room: '$room',
          user: '$user',
          winning: '$winning'
        },
        moves: {
          $push: '$move.kind'
        }
      }
    },
    {
      $sort: {
        '_id.room': 1
      }
    }
      
    ]).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records")
    console.log(JSON.stringify(docs, 1, 4));
    var freq = require('./move_frequency');
    var FrequencyTurn = require('../ai/FrequencyTurn');

    var wins = [];
    var losses = [];

    freq('glory-to-rome', function(ds) {
      var f = new FrequencyTurn(ds, 1, 2, 1);
      console.log(docs.map(function(doc) {

        doc.moves = doc.moves.map(function(move) {
          var out = f.wins({kind:move}).wins / f.wins({kind:move}).plays;
          if (doc._id.winning) {
            wins.push(out);
          }
          else {
            losses.push(out);
          }
          return out;
        }).reduce((a, b) => a + b) / doc.moves.length;
        return doc;
      }));
    });


    callback(docs);
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