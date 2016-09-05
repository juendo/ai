module.exports = function(data, current) {  
  return data.game.players[data.game.currentPlayer].chips ? [{kind: 'chip'}, {kind: 'take'}] : [{kind: 'take'}]
}