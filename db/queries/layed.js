// how many times each player followed each action

module.exports.map = function() {
  emit({name: this.name, building: this.game.players[this.game.currentPlayer].hand[this.move.index].name}, 1);
}

module.exports.reduce = function(key, count) {
  return Array.sum(count);
}