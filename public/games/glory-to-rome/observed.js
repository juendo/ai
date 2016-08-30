module.exports = function(move, game, player, test) {
  // actions observed by their maker
  if ((typeof player === 'undefined') || player === game.currentPlayer) {
    switch (move.kind) {
      case 'skip':
        return {kind: 'skip', action: game.players[game.currentPlayer].actions[0].kind};
      case 'sewer':
        return {kind: 'sewer', color: move.data.card.color};
      case 'fountain':
        return {kind: 'fountain'};
      case 'prison':
        return {kind: 'prison', building: move.building.name, opponent: move.opponent};
      case 'basilica':
        return {kind: 'basilica', name: move.data.card.name};
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
        return {kind: 'takeJack', latrine: move.latrine ? move.latrine.name : "none"};
      case 'drawOne':
        return {kind: 'drawOne', latrine: move.latrine ? move.latrine.name : "none"};
      case 'refill':
        return {kind: 'refill', latrine: move.latrine ? move.latrine.name : "none"};
      case 'lay':
        return {kind: 'lay', name: game.players[game.currentPlayer].hand[move.index].name, color: move.color};
      case 'follow':
        return {kind: 'follow', cards: move.cards.map(function(index) {
          return game.players[game.currentPlayer].hand[index].name;
        }), role: game.players[game.currentPlayer].actions[0].color};
      case 'lead':
        return {kind: 'lead', cards: move.cards.map(function(index) {
          return game.players[game.currentPlayer].hand[index].name;
        }), color: move.role};
      case 'legionary':
        return {kind: 'legionary', color: move.data.card.name};
      case 'romeDemands':
        return {kind: 'romeDemands', name: move.data.card.name};
      case 'vomitorium':
        return {kind: 'vomitorium'};
      default:
        return {};
    }
  } else if (test) {
    // moves observed by other players
    switch (move.kind) {
      case 'skip':
        return {kind: 'skip'};
      case 'sewer':
        return {kind: 'sewer'};
      case 'fountain':
        return {kind: 'fountain'};
      case 'prison':
        return {kind: 'prison'};
      case 'basilica':
        return {kind: 'basilica'};
      case 'atrium':
        return {kind: 'atrium'};
      case 'merchant':
        return {kind: 'merchant'};
      case 'fillFromPool':
        var index = (typeof move.player !== 'undefined') ? move.player : game.currentPlayer;
        return {kind: 'fillFromPool', opponent: (index === game.currentPlayer) ? "you" : "other"};
      case 'fillFromStockpile':
        var index = (typeof move.player !== 'undefined') ? move.player : game.currentPlayer;
        return {kind: 'fillFromStockpile', opponent: (index === game.currentPlayer) ? "you" : "other"};
      case 'fillFromHand':
        return {kind: 'fillFromHand'};
      case 'dock':
        return {kind: 'dock'};
      case 'laborer':
        return {kind: 'laborer'};
      case 'aqueduct':
        return {kind: 'aqueduct'};
      case 'bar':
        return {kind: 'bar'};
      case 'patron':
        return {kind: 'patron'};
      case 'takeJack':
        return {kind: 'takeJack'};
      case 'drawOne':
        return {kind: 'drawOne'};
      case 'refill':
        return {kind: 'refill'};
      case 'lay':
        return {kind: 'lay', color: move.color};
      case 'follow':
        return {kind: 'follow'};
      case 'lead':
        return {kind: 'lead', color: move.role};
      case 'legionary':
        return {kind: 'legionary'};
      case 'romeDemands':
        return {kind: 'romeDemands'};
      case 'vomitorium':
        return {kind: 'vomitorium'};
      default:
        return {};
    } 
  } else if (!test) {
    // moves observed by other players
    switch (move.kind) {
      case 'skip':
        return {kind: 'skip', action: game.players[game.currentPlayer].actions[0].kind};
      case 'sewer':
        return {kind: 'sewer', color: move.data.card.color};
      case 'fountain':
        return {kind: 'fountain'};
      case 'prison':
        return {kind: 'prison', building: move.building.name, opponent: move.opponent};
      case 'basilica':
        return {kind: 'basilica'};
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
        return {kind: 'takeJack', latrine: move.latrine ? move.latrine.color : "none"};
      case 'drawOne':
        return {kind: 'drawOne', latrine: move.latrine ? move.latrine.color : "none"};
      case 'refill':
        return {kind: 'refill', latrine: move.latrine ? move.latrine.color : "none"};
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
        return {kind: 'romeDemands', name: move.data.card.color};
      case 'vomitorium':
        return {kind: 'vomitorium'};
      default:
        return {};
    }
  }
}