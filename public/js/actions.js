angular.module('Game').factory('actions', function ($rootScope) {
  $rootScope.game = state;
  $rootScope.meta = {you: 0};

  $rootScope.control = {
    'person': {
      if: function(game) {
        return true;
      },
      click: function(game) {
        game.finished = true;
      }
    } 
  }

  actions.applyMove = function(move, game) {
  	var newState = actions[move.kind](move, game, game.players[game.currentPlayer]);

    if (newState) this.checkIfGameOver(newState);
    
    return newState;
  }

  return actions;
});