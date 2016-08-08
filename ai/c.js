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
var p1 = new AIPlayer('c = 0.35', function(state) {
  return moismcts.testMove(game(state), 100, {
    db: 0,
    c: 0.35
  });
});
var p2 = new AIPlayer('c = 0.7', function(state) {
  return moismcts.testMove(game(state), 100, {
    db: 0,
    c: 0.7
  });
});
var p3 = new AIPlayer('c = 1.05', function(state) {
  return moismcts.testMove(game(state), 100, {
    db: 0,
    c: 1.05
  });
});
var p4 = new AIPlayer('c = 1.4', function(state) {
  return moismcts.testMove(game(state), 100, {
    db: 0,
    c: 1.4
  });
});

var n = 66;

while (n--) {
  var match = new AIMatch([p1, p2, p3, p4], JSON.parse(JSON.stringify(rules.state)));
  match.run();
  match = new AIMatch([p1, p3, p2, p4], JSON.parse(JSON.stringify(rules.state)));
  match.run();
  match = new AIMatch([p1, p4, p2, p3], JSON.parse(JSON.stringify(rules.state)));
  match.run();
  match = new AIMatch([p1, p2, p4, p3], JSON.parse(JSON.stringify(rules.state)));
  match.run();
  match = new AIMatch([p1, p3, p4, p2], JSON.parse(JSON.stringify(rules.state)));
  match.run();
  match = new AIMatch([p1, p4, p3, p2], JSON.parse(JSON.stringify(rules.state)));
  match.run();
}