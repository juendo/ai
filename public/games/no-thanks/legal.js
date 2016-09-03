module.exports = function(game, current) {  
  return data.game.players[data.game.currentPlayer].chips ? [{kind: 'chip'}, {kind: 'take'}] : [{kind: 'take'}]
}