var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

if (process.env.DB_PASS) {
  console.log('db password set');
  var url = process.env.DB_PASS
} else {
  console.log('db password not set');
  var url = require('./password');
}

var findDocuments = function(game, users, db, callback) {

  db.collection(game).aggregate([
        {
          $match: {
            'forced': {
              $ne: true
            }
          }
        },
        {
          $group: {
            _id: {
              move: '$move.kind',
              player: '$user'
            },
            total: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.move',
            user: {
              $push: {
                player: '$_id.player',
                total: '$total'
              }
            },
            total: {
              $sum: '$total'
            }
          }
        },
        {
          $unwind: '$user'
        },
        {
          $group: {
            _id: '$user.player',
            moves: {
              $push: {
                move: '$_id',
                total: '$user.total',
                overall: '$total'
              }
            },
            total: {
              $sum: '$user.total'
            }
          }
        },
        {
          $group: {
            _id: null,
            players: {
              $push: {
                name: '$_id',
                moves: '$moves',
                total: '$total'
              }
            },
            overall: {
              $sum: '$total'
            }
          }
        },
        {
          $unwind: '$players'
        },
        {
          $match: {
            'players.name': {
              $in: users
            }
          }
        }
      ]).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log(JSON.stringify(docs, 1, 4));
      callback(docs);
    });
}


module.exports = function(game, users, callback) {
  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log(err);
    } else {
      findDocuments(game, users, db, function(docs) {
        db.close();
        callback(docs);
      });
    }
  });
}