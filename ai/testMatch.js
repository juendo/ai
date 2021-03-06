'use strict'

var translateMove = require('../public/games/manifesto/moves');
var settings = require('./testSettings');
var save = require('../db/save_moves.js');

class AIPlayer {
  constructor(name, getMove) {
    this.name = name;
    this.getMove = getMove;
  }
}

class AIMatch {

  constructor(players, state) {

    this.players = players;
    this.state = state;

    var basicPlayer = JSON.parse(JSON.stringify(state.players[0]));

    state.players = [];

    players.forEach(function(player) {
      // duplicate basic player
      var actualPlayer = JSON.parse(JSON.stringify(basicPlayer));
      actualPlayer.name = player.name;
      this.state.players.push(actualPlayer);
    }, this);
    
    var rules = require('../public/games/' + state.gameName + '/rules');
    this.actions = rules.actions;

    this.actions.start(this.state);

    console.log(JSON.stringify(this.state));
    this.initial = JSON.parse(JSON.stringify(this.state));
  }

  run() {

    this.state = JSON.parse(JSON.stringify(this.initial));
    var initial = JSON.parse(JSON.stringify(this.state));

    var moves = [];

    while (!this.state.finished) {

      var move = this.players[this.state.currentPlayer].getMove(this.state);

      console.log(this.state.players[this.state.currentPlayer].name);
      console.log(translateMove(move, this.state));

      this.actions.applyMove(move, this.state);
      console.log(this.state.electorate);
      moves.push(move);
    }

    console.log('winner:');

    console.log(this.actions.winner(this.state).map(function(index) {
      return this.state.players[index].name;
    }, this));

    console.log(this.state.electorate);

    //save({
    //  initial: initial,
    //  moves: moves,
    //  winner: this.actions.winner(this.state)
    //});
  }
}

var moismcts = require('./moismcts');
var random = require('./random');
var game = require('./game');

var rules = require('../public/games/manifesto/rules');

var frequency = require('../db/move_frequency');
var sequence = require('../db/get_sequence');
var turns = require('../db/get_turns');
var user = require('../db/user_policy');

var GameData = require('./GameData');


sequence('glory-to-rome', function(seq) {

  frequency('glory-to-rome', function(freq) {

    turns('glory-to-rome', function(turn) {

      user('glory-to-rome', ['Delargsson', 'Hendo'], function(user) {

        //var n = 60;

        //while (n--) {

          var match = new AIMatch(settings.map(function(setting) {

            var data = new GameData(freq, seq, turn, user, settings.length, setting);

            return new AIPlayer(setting.name, function(state) {
              return random.testMove(game(state), data);
            });

          }), JSON.parse(JSON.stringify(rules.state)));
          
          var n = 60;

          while (n--)
            match.run();
        //}
      });
    });
  });
});

