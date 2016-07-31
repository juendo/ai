module.exports = function(move, game) {
  switch (move.kind) {
    case 'skip':
      return {kind: 'skip', action: game.players[game.currentPlayer].actions[0].kind};
    case 'sewer':
      return {kind: 'sewer', color: move.data.card.color};
    case 'fountain':
      return {kind: 'fountain'};
    case 'prison':
      return {kind: 'prison'};
    case 'basilica':
      return {kind: 'basilica', name: move.data.card.color};
    case 'atrium':
      return {kind: 'atrium'};
    case 'merchant':
      return {kind: 'merchant', color: move.data.material};
    case 'fillFromPool':
      var index = (typeof move.player !== 'undefined') ? move.player : game.currentPlayer;
      return {kind: 'fillFromPool', name: game.players[index].buildings[move.building].name, color: move.color, opponent: (index === game.currentPlayer) ? "you" : "other"};
    case 'fillFromStockpile':
      var index = (typeof move.player !== 'undefined') ? move.player : game.currentPlayer;
      return {kind: 'fillFromStockpile', name: game.players[index].buildings[move.building].name, color: move.data.material, opponent: (index === game.currentPlayer) ? "you" : "other"};
    case 'fillFromHand':
      return {kind: 'fillFromHand', name: game.players[game.currentPlayer].buildings[move.building].name, card: move.data.card.color};
    case 'dock':
      return {kind: 'dock', name: move.data.card.color};
    case 'laborer':
      return {kind: 'laborer', color: move.color};
    case 'aqueduct':
      return {kind: 'aqueduct', name: move.data.card.color};
    case 'bar':
      return {kind: 'bar'};
    case 'patron':
      return {kind: 'patron', color: move.color};
    case 'takeJack':
      return {kind: 'takeJack', latrine: move.latrine ? move.latrine : "none"};
    case 'drawOne':
      return {kind: 'drawOne', latrine: move.latrine ? move.latrine : "none"};
    case 'refill':
      return {kind: 'refill', latrine: move.latrine ? move.latrine : "none"};
    case 'lay':
      return {kind: 'lay', name: game.players[game.currentPlayer].hand[move.index].name, color: move.color};
    case 'follow':
      return {kind: 'follow', cards: move.cards.map(function(index) {
        return game.players[game.currentPlayer].hand[index].color;
      }), role: game.players[game.currentPlayer].actions[0].color};
    case 'lead':
      return {kind: 'lead', cards: move.cards.map(function(index) {
        return game.players[game.currentPlayer].hand[index].color;
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