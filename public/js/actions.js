angular.module('Game').factory('actions', function ($rootScope) {
  $rootScope.game = state;
  $rootScope.meta = {you: 0};

  actions.applyMove = function(move, game) {
  	var newState = actions[move.kind](move, game, game.players[game.currentPlayer]);

    if (newState) {
    	this.checkIfGameOver(newState);
    	game.turn++;
      game.moves.push(move);
    }
    
    return newState;
  }

  return actions;
});