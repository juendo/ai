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
  db.collection('glory-to-rome-sequence').drop();
  db.collection('glory-to-rome-games').aggregate([
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
          },
        }
      },
      {
        $sort: {
          '_id.room': 1,
          '_id.user': 1,
          '_id.turn': 1
        }
      }
    ]).toArray(function(err, docs) {
    assert.equal(err, null);
    console.log("Found the following records")
    console.log(docs);
    //console.log(JSON.stringify(docs, 1, 4));

    //iterate over these, logging the sequence of move kinds and whether it was winning
    var sequences = [{}, {}, {}, {}, {}, {}];
    for (var i = 0; i < docs.length - 1; i++) {
      if (docs[i + 1]._id.turn > 0 && docs[i]._id.user === docs[i + 1]._id.user && docs[i]._id.room === docs[i + 1]._id.room && !docs[i]._id.forced && !docs[i + 1]._id.forced) {
        if (!sequences[docs[i]._id.players][JSON.stringify({first: docs[i]._id.move.kind, second: docs[i + 1]._id.move.kind})]) {
          sequences[docs[i]._id.players][JSON.stringify({first: docs[i]._id.move.kind, second: docs[i + 1]._id.move.kind})] = {
            wins: docs[i]._id.winning ? 1 : 0,
            plays: 1
          }
        } else {
          sequences[docs[i]._id.players][JSON.stringify({first: docs[i]._id.move.kind, second: docs[i + 1]._id.move.kind})].plays++;
          sequences[docs[i]._id.players][JSON.stringify({first: docs[i]._id.move.kind, second: docs[i + 1]._id.move.kind})].wins += docs[i]._id.winning ? 1 : 0;
        }
      }
    }
    console.log(sequences);
    var s = {};
    Object.keys(sequences).forEach(function(key) {
      Object.keys(sequences[key]).forEach(function(combo) {
        if (typeof s[combo] === 'undefined') {
          var d = {
            plays: sequences[key][combo].plays,
            ratio: Math.pow(sequences[key][combo].wins / sequences[key][combo].plays, Math.log(2, key))
          }
          d.wins = d.ratio * d.plays;
          s[combo] = d;
        } else {
          var record = s[combo];

          record.ratio = (record.plays * record.ratio + Math.pow(
              sequences[key][combo].wins / sequences[key][combo].plays,
              Math.log(2, key)
            ) * sequences[key][combo].plays
          ) / (sequences[key][combo].plays + record.plays);
          record.plays = sequences[key][combo].plays + record.plays;
          record.wins = record.ratio * record.plays;
        }
      });
    });
    var ss = Object.keys(s).map(function(key) {
      var moves = JSON.parse(key);
      return {
        first: moves.first,
        second: moves.second,
        plays: s[key].plays,
        wins: s[key].wins,
        ratio: s[key].ratio
      }
    });
    console.log(ss);
    db.collection('glory-to-rome-sequence').insert(ss);
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