module.exports = function(move, game, player) {
  switch (move.kind) {
    case 'take':
      return {kind: 'take', card: game.currentCard.value};
    case 'chip':
      return {kind: 'chip', card: game.currentCard.value};
    default:
      return {};
  }
}