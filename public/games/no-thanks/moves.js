moves = {
  
  take: function(move, game) {
  	return {kind: 'take', card: game.currentCard.value};
  },

  chip: function(move, game) {
  	return {kind: 'chip', card: game.currentCard.value};
  }
  
}

module.exports = function(move, game) {
  return moves[move.kind](move, game);
}