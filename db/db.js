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
  db.collection('glory-to-rome').aggregate([
  

      {
        $group: {
          // remove duplicates
          _id: {
            move: '$move',
            user: '$user',
            winning: '$winning',
            players: '$players',
            turn: '$turn',
            room: '$room',
            forced: '$forced'          
          }
        }
      },
      {
        $group: {
          // group by number of players
          _id: {
            move: '$_id.move.kind',
            players: '$_id.players'
          },
          winning: {
            $sum: {
              $cond: ['$_id.winning', 1, 0]
            }
          },
          total: {
            $sum: 1
          }
        }
      }
      
    ]).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records")
      this.docs = {};
      this.playerCount = 2;
      this.totalWins = 0;
      this.size = docs.length;

      docs.forEach(function(doc) {

        if (typeof this.docs[JSON.stringify(doc['_id']['move'])] === 'undefined') {

          this.docs[JSON.stringify(doc['_id']['move'])] = {
            total: doc['total'],
            ratio: Math.pow(
              doc['winning'] / doc['total'],
              logBase(playerCount, doc['_id']['players'])
            )
          };
          
        } else {

          var record = this.docs[JSON.stringify(doc['_id']['move'])];

          record.ratio = (record.total * record.ratio + Math.pow(
              doc['winning'] / doc['total'],
              logBase(playerCount, doc['_id']['players'])
            ) * doc['total']
          ) / (doc['total'] + record.total);

          record.total = doc['total'] + record.total;

        } 
      }, this);

      console.log(this.docs);

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