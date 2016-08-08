'use strict'

var translateMove = require('../public/games/glory-to-rome/moves');

class AIPlayer {
  constructor(name, getMove) {
    this.name = name;
    this.getMove = getMove;
  }
}

class AIMatch {

  constructor(players, state) {

    this.players = players;
    var basicPlayer = JSON.parse(JSON.stringify(state.players[0]));
    this.state = state;
    state.players = [];
    players.forEach(function(player) {
      // duplicate basic player
      var actualPlayer = JSON.parse(JSON.stringify(basicPlayer));
      actualPlayer.name = player.name;
      this.state.players.push(actualPlayer);
    }, this);
    
    var rules = require('../public/games/' + state.gameName + '/rules');
    this.actions = rules.actions;
  }

  run() {

    this.actions.start(this.state);
    console.log(JSON.stringify(this.state));
    while (!this.state.finished) {
      var move = this.players[this.state.currentPlayer].getMove(this.state);
      console.log(translateMove(move, this.state));
      this.actions.applyMove(move, this.state);
    }
    console.log('winner:');
    console.log(this.actions.winner(this.state).map(function(index) {
      return this.state.players[index].name;
    }, this));
  }
}

var moismcts = require('./moismcts');
var game = require('./game');

var rules = require('../public/games/glory-to-rome/rules');

var freq = require('../db/move_frequency');

freq('glory-to-rome', function(freq) {

  var p1 = new AIPlayer('db = 0', function(state) {
    return moismcts.testMove(game(state), 250, {
      db: 0,
      c: 0.875
    }, freq);
  });

  var p2 = new AIPlayer('db = 0.04', function(state) {
    return moismcts.testMove(game(state), 250, {
      db: 10,
      c: 0.875
    }, freq);
  });

  var n = 66;

  while (n--) {
    var match = new AIMatch([p1, p2], JSON.parse(JSON.stringify(rules.state)));
    match.run();
  }

});

