var moves = {

  skip: function(move, game) {
    return {kind: 'skip', action: game.players[game.currentPlayer].actions[0].kind};
  },

  sewer: function(move, game) {
    return {kind: 'sewer', color: move.data.card.color};
  },

  fountain: function(move, game) {
    return {kind: 'fountain'};
  },

  prison: function(move, game) {
    return {kind: 'prison'};
  },

  basilica: function(move, game) {
    return {kind: 'basilica', name: move.data.card.color};
  },

  atrium: function(move, game) {
    return {kind: 'atrium'};
  },

  merchant: function(move, game) {
    return {kind: 'merchant', color: move.data.material};
  },

  fillFromPool: function(move, game) {
    var index = (typeof move.player !== 'undefined') ? move.player : game.currentPlayer;
    return {kind: 'fillFromPool', name: game.players[index].buildings[move.building].name, color: move.color, opponent: (index === game.currentPlayer) ? "you" : "other"};
  },

  fillFromStockpile: function(move, game) {
    var index = (typeof move.player !== 'undefined') ? move.player : game.currentPlayer;
    return {kind: 'fillFromStockpile', name: game.players[index].buildings[move.building].name, color: move.data.material, opponent: (index === game.currentPlayer) ? "you" : "other"};
  },

  fillFromHand: function(move, game) {
    return {kind: 'fillFromHand', name: game.players[game.currentPlayer].buildings[move.building].name, card: move.data.card.color};
  },

  dock: function(move, game) {
    return {kind: 'dock', name: move.data.card.color};
  },

  laborer: function(move, game) {
    return {kind: 'laborer', color: move.color};
  },

  aqueduct: function(move, game) {
    return {kind: 'aqueduct', name: move.data.card.color};
  },

  bar: function(move, game) {
    return {kind: 'bar'};
  },

  patron: function(move, game) {
    return {kind: 'patron', color: move.color};
  },

  takeJack: function(move, game) {
    return {kind: 'takeJack', latrine: move.latrine ? move.latrine : "none"};
  },

  drawOne: function(move, game) {
    return {kind: 'drawOne', latrine: move.latrine ? move.latrine : "none"};
  },

  refill: function(move, game) {
    return {kind: 'refill', latrine: move.latrine ? move.latrine : "none"};
  },

  lay: function(move, game) {
    return {kind: 'lay', name: game.players[game.currentPlayer].hand[move.index].name, color: move.color};
  },

  follow: function(move, game) {
    return {kind: 'follow', cards: move.cards.map(function(index) {
      return game.players[game.currentPlayer].hand[index].color;
    }), role: game.players[game.currentPlayer].actions[0].color};
  },

  lead: function(move, game) {
    return {kind: 'lead', cards: move.cards.map(function(index) {
      return game.players[game.currentPlayer].hand[index].color;
    }), color: move.role};
  },

  legionary: function(move, game) {
    return {kind: 'legionary', color: move.data.card.color};
  },

  romeDemands: function(move, game) {
    return {kind: 'romeDemands', name: move.data.card.name};
  },
  
  vomitorium: function(move, game) {
    return {kind: 'vomitorium'};
  }
}

module.exports = function(move, game) {
  return moves[move.kind](move, game);
}