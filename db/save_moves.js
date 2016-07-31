module.exports = function(data) {

  console.log(data);

  var moves = data.moves;
  var winner = data.winner;
  var state = data.initial;

  var translate = require('../public/games/' + state.gameName + '/moves');
  var rules = require('../public/games/' + state.gameName + '/rules');
  var actions = rules.actions;

	var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

  // Connection URL
  var url = require('./password');

  var saveMoves = function(db, callback) {

    var store = db.collection(state.gameName);

    store.insert(moves.map(function(move) {

      var m = {
        move: translate(move, state),
        user: state.players[state.currentPlayer].name,
        winning: winner.indexOf(state.currentPlayer) >= 0,
        players: state.players.length,
        turn: state.turn
      }

      // apply the move to get the next state
      state = JSON.parse(JSON.stringify(actions.applyMove(move, state)));

      return m;
    }));

    db.collection(state.gameName + '-wins').drop();

    db.collection(state.gameName).aggregate([
        {
          $group: {
            _id: '$move',
            winning: { $sum: { $cond: ['$winning', 1, 0] } },
            total: { $sum: 1 }
          }
        }
      ]).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      db.collection(state.gameName + '-wins').insert(docs);
      console.log(JSON.stringify(docs));

      callback(docs);
    });
  }

  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected succesfully to server");

    saveMoves(db, function() {
        db.close();
    });
  });
}