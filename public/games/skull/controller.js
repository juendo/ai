angular.module('Game').controller('GameController', function($scope, socket, actions) {

  $scope.actions = actions;
  
  $scope.yourTurn = function() {
    return $scope.game.currentPlayer == $scope.meta.you && !$scope.game.finished;
  }

  $scope.you = function() {
    return $scope.game.players[$scope.meta.you];
  }

});