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

var mcts = require('./mcts');
var ismcts = require('./ismcts');
var moismcts = require('./moismcts');
var game = require('./game');

var rules = require('../public/games/glory-to-rome/rules');
var p1 = new AIPlayer('MCTS', function(state) {
  return mcts.testMove(game(state), 100, {
    db: 0,
    c: 0.3
  });
});
var p2 = new AIPlayer('ISMCTS', function(state) {
  return ismcts.testMove(game(state), 100, {
    db: 0,
    c: 0.7
  });
});
var p3 = new AIPlayer('MOISMCTS', function(state) {
  return moismcts.testMove(game(state), 100);
});

var n = 50;

while (n--) {
  var match = new AIMatch([p1, p2, p3], JSON.parse(JSON.stringify(rules.state)));
  match.run();
  match = new AIMatch([p1, p3, p2], JSON.parse(JSON.stringify(rules.state)));
  match.run();
}