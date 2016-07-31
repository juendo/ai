angular.module('Game').factory('actions', function ($rootScope) {
  $rootScope.game = state;
  $rootScope.meta = {you: 0};
  $rootScope.moves = [];

  actions.applyMove = function(move, game) {
    
    move.maker = game.currentPlayer;

  	var newState = actions[move.kind](move, game, game.players[game.currentPlayer]);

    if (newState) {
    	this.checkIfGameOver(newState);
    	game.turn++;
      $rootScope.moves.push(move);
    }
    
    return newState;
  }

  Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
      if (this[i] === obj) {
        return true;
      }
    }
    return false;
  }

  return actions;
});