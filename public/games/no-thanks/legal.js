'use strict'

// AI that plays each action according to basic rules of thumb
// want to get all possible legal moves for a player
class BasicAI {
  constructor(data, current) {
    // extract the VISIBLE information

    // the current player
    var game = data.game;
    this.game = game;
    this.player = this.game.players[this.game.currentPlayer];
  }

  moveset() {
    return this.player.chips ? [{kind: 'chip'}, {kind: 'take'}] : [{kind: 'take'}];
  }
}

module.exports = function(game, current) {
  var g = new BasicAI(game, current);
  return g.moveset();
}