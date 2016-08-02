var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

// Connection URL
var url = require('./password');

var queries = require('./queries');

var findDocuments = function(db, callback) {
  // Get the documents collection
  var moves = db.collection('Moves');
  // Find some documents

  // remove undesired names
  //moves.remove(queries.delete_names);

  db.collection('glory-to-rome').aggregate([
      {
        $group: {
          // group by number of players
          _id: {
            move: '$move',
            players: '$players'
          },
          winning: { $sum: { $cond: ['$winning', 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records");
    db.collection('glory-to-rome-wins').insert(docs);
    console.log(JSON.stringify(docs));

    callback(docs);
  });
  // rename
  //moves.update({"game.room": "f57q7y"}, {$set: {winner: "Hendo"}}, {multi: true});

  /*moves.mapReduce(queries.winning_buildings.map, queries.winning_buildings.reduce, {out: 'r2', query: {'move.kind': 'Lay'}});
  db.collection('r2').aggregate([
    {
      $group: {
        _id: {
          name: "$_id.winning"
        },
        buildings: {
          $push: {
            name: "$_id.building",
            count: "$value"
          }
        }
      }
    }
  ]).toArray(function(err, docs) {assert.equal(err, null);console.log("Found the following records");console.log(JSON.stringify(docs));callback(docs);});
*/
  //moves.aggregate(queries.names).toArray(function(err, docs) {assert.equal(err, null);console.log("Found the following records");console.log(JSON.stringify(docs));callback(docs);});  
  //moves.aggregate(queries.winning_moves).toArray(function(err, docs) {assert.equal(err, null);console.log("Found the following records");console.log(JSON.stringify(docs));callback(docs);});
}

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected succesfully to server");

  findDocuments(db, function() {
      db.close();
  });
});