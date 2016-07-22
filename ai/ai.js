'use strict'

var translateMove = function(move, game) {
  switch (move.kind) {
    case 'skip':
      return {kind: 'skip'};
    case 'sewer':
      return {kind: 'sewer', color: move.data.card.color};
    case 'fountain':
      return {kind: 'fountain'};
    case 'prison':
      for (var i = 0; i < game.players.length; i++) {
        if (game.players[i].name === move.opponent.name) { 
          var opponent = i;
          break;
        }
      }
      return {kind: 'prison', opponent: opponent, name: move.building.name};
    case 'basilica':
      return {kind: 'basilica', name: move.data.card.name};
    case 'atrium':
      return {kind: 'atrium'};
    case 'merchant':
      return {kind: 'merchant', color: move.data.material};
    case 'fillFromPool':
      var index = (typeof move.player !== 'undefined') ? move.player : game.currentPlayer;
      return {kind: 'fillFromPool', name: game.players[index].buildings[move.building].name, color: move.color, opponent: (index === game.currentPlayer) ? "you" : index};
    case 'fillFromStockpile':
      var index = (typeof move.player !== 'undefined') ? move.player : game.currentPlayer;
      return {kind: 'fillFromStockpile', name: game.players[index].buildings[move.building].name, color: move.data.material, opponent: (index === game.currentPlayer) ? "you" : index};
    case 'fillFromHand':
      return {kind: 'fillFromHand', name: game.players[game.currentPlayer].buildings[move.building].name, card: move.data.card.name};
    case 'dock':
      return {kind: 'dock', name: move.data.card.name};
    case 'laborer':
      return {kind: 'laborer', color: move.color};
    case 'aqueduct':
      return {kind: 'aqueduct', name: move.data.card.name};
    case 'bar':
      return {kind: 'bar'};
    case 'patron':
      return {kind: 'patron', color: move.color};
    case 'takeJack':
      return {kind: 'takeJack'};
    case 'drawOne':
      return {kind: 'drawOne'};
    case 'refill':
      return {kind: 'refill'};
    case 'lay':
      return {kind: 'lay', name: game.players[game.currentPlayer].hand[move.index].name, color: move.color};
    case 'follow':
      return {kind: 'follow', cards: move.cards.map(function(index) {
        return game.players[game.currentPlayer].hand[index].name;
      })};
    case 'lead':
      return {kind: 'lead', cards: move.cards.map(function(index) {
        return game.players[game.currentPlayer].hand[index].name;
      }), color: move.role};
    case 'legionary':
      return {kind: 'legionary', color: move.data.card.color};
    case 'romeDemands':
      return {kind: 'romeDemands', name: move.data.card.name};
    case 'vomitorium':
      return {kind: 'vomitorium'};
    default:
      return {};
  }
}

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
    while (!this.state.finished) {
      var move = this.players[this.state.currentPlayer].getMove(this.state);
      console.log(translateMove(move, this.state));
      this.actions.applyMove(move, this.state);
    }
    console.log('winner:');
    console.log(this.actions.winner(this.state));
  }
}

var ai = require('./mcts');
var rules = require('../public/games/glory-to-rome/rules');
var p1 = new AIPlayer('MCTS 1', function(state) {
  var game = require('./game');
  return ai.getMove(game(state), 100);
});
var p2 = new AIPlayer('MCTS 2', function(state) {
  var game = require('./game');
  return ai.getMove(game(state), 200);
});

var match = new AIMatch([p1, p2], rules.state);
match.run();