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
  db.collection('glory-to-rome-turns').drop();
  db.collection('glory-to-rome-games').aggregate([
  
    {
      $match: {
        forced: false,
        winning: true
      }
    },
    {
      $group: {
        _id: {
          move: '$move.kind'
        },
        turns: {
          $push: {
            $divide: ['$turn', '$players']
          }
        },
        max: {
          $max: {
            $divide: ['$turn', '$players']
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        moves: {
          $push: {
            kind: '$_id.move',
            turns: '$turns'
          }
        },
        max: {
          $max: '$max'
        }
      }
    }
      
    ]).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records")
    
    docs.forEach(function(doc) {
      doc.moves.forEach(function(move) {
        move.dist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        move.turns.forEach(function(turn) {
          move.dist[Math.floor(10 * turn / doc.max)]++;
        });
        delete move.turns;
      })
    });
    console.log(JSON.stringify(docs, 1, 4));
    docs[0].moves.push({
      kind: 'maxTurn',
      dist: [docs[0].max, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    db.collection('glory-to-rome-turns').insert(docs[0].moves);
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