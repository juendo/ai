angular.module('Game').controller('GameController', function($scope, socket, actions) {

  $scope.actions = actions;
  
  $scope.take = function(game) {
    if (actions.applyMove({kind: 'take'}, game)) socket.update();
  }
  $scope.chip = function(game) {
    if (actions.applyMove({kind: 'chip'}, game)) socket.update();
  }
  $scope.yourTurn = function() {
    return $scope.game.currentPlayer == $scope.meta.you && !$scope.game.finished;
  }

  $scope.you = function() {
    return $scope.game.players[$scope.meta.you];
  }

  $scope.buildingWidth = function(len) {
    var ratio = 1;
    // the width of a player box
    var width = 95 / ratio;
    var height = $(window).height() * 0.68 * 0.92;

    while (0.01 * (292/208) * $(window).width() * width * Math.ceil(len / ratio) / $scope.game.players.length + 10 * Math.ceil(len / ratio) > height) {
      width = 95 / ++ratio;
    }
    return width;
  }
});