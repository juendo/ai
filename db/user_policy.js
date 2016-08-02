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
            },
            'user': {
              $in: users
            }
          }
        },
        {
          $group: {
            _id: {
              move: '$move',
              player: '$user'
            },
            total: { $sum: 1 }
          }
        }
      ]).toArray(function(err, docs) {
      assert.equal(err, null);
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