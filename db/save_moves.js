module.exports = function(data) {


  var moves = data.moves;
  var winner = data.winner;
  var state = data.initial;

  var translate = require('../public/games/' + state.gameName + '/moves');
  var rules = require('../public/games/' + state.gameName + '/rules');
  var actions = rules.actions;
  var legal = require('../public/games/' + state.gameName + '/legal');

	var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

  // Connection URL
  if (process.env.DB_PASS) {
    var url = process.env.DB_PASS
  } else {
    console.log('db password not set');
    var url = require('./password');
  }
  
  var saveMoves = function(db, callback) {

    var store = db.collection(state.gameName);

    store.insert(moves.map(function(move) {

      // check if the move was forced

      var m = {
        move: translate[move.kind](move, state),
        user: state.players[state.currentPlayer].name,
        winning: winner.indexOf(state.currentPlayer) >= 0,
        players: state.players.length,
        turn: state.turn,
        room: state.room,
        forced: false
      }

      // check if move was the only option
      if (legal({game: state}, null).length === 1) m.forced = true;

      // apply the move to get the next state
      state = JSON.parse(JSON.stringify(actions.applyMove(move, state)));

      return m;
    }, this));

    db.collection(state.gameName + '-wins').drop();

    db.collection(state.gameName).aggregate([
      {
        $match: {
          turn: {
            $ne: null
          },
          forced: false
        }
      },
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
      console.log("Found the following records");
      db.collection(state.gameName + '-wins').insert(docs);
      console.log(JSON.stringify(docs));

      callback(docs);
    });
  }

  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected succesfully to server");

      saveMoves(db, function() {
          db.close();
      });
    }
  });
}