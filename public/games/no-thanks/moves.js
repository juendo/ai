module.exports = {
  
  take: function(move, game) {
  	return {kind: 'take', card: game.currentCard.value};
  },

  chip: function(move, game) {
  	return {kind: 'chip', card: game.currentCard.value};
  }
  
}