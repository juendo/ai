angular.module('Game').controller('GameController', function($scope, socket, actions, inputs) {

  // expose actions
  $scope.actions = actions;

  // expose inputs
  $scope.inputs = {};
  Object.keys(inputs).forEach(function(input) {
    $scope.inputs[input] = function(game, meta, data) {
      if (game.currentPlayer !== meta.you || game.finished) return;
      var move = inputs[input](game, meta, data);
      if (typeof move !== 'undefined' && actions.applyMove(move, game)) socket.update();
    }
  });

  $scope.triggerReconnect = function() {
    socket.update($scope.game);
  };
  
  $scope.you = function() {
    return $scope.game.players[$scope.meta.you];
  };

  $scope.yourTurn = function() {
    return $scope.game.currentPlayer === $scope.meta.you;
  };

  $scope.poolColors = 
    [ 'yellow',
      'green',
      'grey',
      'red',
      'purple',
      'blue'
    ]
  $scope.spacing = function(len) {
    if (len <= 1) return 20;
    else if (len == 2) {
      return ($(window).width()*0.5-0.92*0.25*$(window).height()*208/292)/2;
    }
    else {
      // if height of card plus spacings is too wide
      return ($(window).width()*0.5-0.92*0.25*$(window).height()*208/292)/(len-1);
    }
  };
  $scope.actionColors = 
    { 'Lead' : 'FFF',
      'Follow' : 'FFF',
      'Jack' : 'FFF',
      'Craftsman' : '2CA73D',
      'Laborer' : 'F7B628',
      'Architect' : '9B9D88',
      'Legionary' : 'E5020C',
      'Patron' : '8E2170',
      'Merchant' : '02AEDE',
      'Rome Demands' : 'FFF',
      'Think' : 'FFF',
      'Prison' : 'FFF',
      'Sewer' : 'FFF',
    }
  $scope.actionBorderColors = 
    { 'Lead' : '222',
      'Follow' : '222',
      'Jack' : '222',
      'Craftsman' : '2CA73D',
      'Laborer' : 'F7B628',
      'Architect' : '9B9D88',
      'Legionary' : 'E5020C',
      'Patron' : '8E2170',
      'Merchant' : '02AEDE',
      'Rome Demands' : '000',
      'Think' : '222',
      'Prison' : '222'
    }
  $scope.materials = 
    { 'yellow' : 'rubble',
      'green' : 'wood',
      'grey' : 'concrete',
      'red' : 'brick',
      'purple' : 'marble',
      'blue' : 'stone'
    }
  $scope.colors = 
    { 'yellow' : 'F7B628',
      'green' : '2CA73D',
      'grey' : '9B9D88',
      'red' : 'E5020C',
      'purple' : '8E2170',
      'blue' : '02AEDE',
      'black' : '000'
    }
  $scope.colorValues = 
    { 'yellow' : 1,
      'green' : 1,
      'grey' : 2,
      'red' : 2,
      'purple' : 3,
      'blue' : 3
    }

  $scope.actionNumber = function(player) {
    var number = 1;
    if (player.actions.length < 2) return 0;
    else {
      var kind = player.actions[0].kind;
      for (var i = 1; i < player.actions.length; i++) {
        if (player.actions[i].kind === kind) {
          number++;
        } else {
          break;
        }
      }
    }
    return number;
  }

  $scope.canSkipCurrentAction = function(player, game) {
    var action = player.actions[0];
    switch (action.kind) {
      case 'Jack':
      case 'Lead':
      case 'Follow':
      case 'Statue':
      case 'Think':
        return !!action.skippable;
        // CAN SKIP THINKS FROM ACADEMY
      case 'Rome Demands':
        var hasMaterial = false;
        player.hand.forEach(function(card) {
          hasMaterial = hasMaterial || action.material == card.color;
        });
        return !hasMaterial || actions.hasAbilityToUse('Wall', player) || (actions.hasAbilityToUse('Palisade', player) && !actions.hasAbilityToUse('Bridge', game.players[action.demander]));
      default:
        return true;
    }
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

  $scope.speciesHeight = function(number) {
    var fullHeight = $(window).height() * 0.68;
    var fullWidth = $(window).width();
    var players = $scope.game.players.length;

    return (fullHeight - 0.02 * number * fullWidth / players) / number;
  }

  $scope.maxSpeciesHeight = function() {
    var fullHeight = $(window).height() * 0.68;
    var fullWidth = $(window).width();
    var players = $scope.game.players.length;

    return (fullWidth * 0.93 * 0.25 / players) * (1034 / 742);
  }

  $scope.minim = Math.min;

  $(window).resize(function() {
    $scope.$apply();
  });

  $scope.getArray = function(num) {
    return new Array(num);};

  $scope.relevantAction = function(building, action) {
    switch (building) {
      case 'Archway':
      return action.kind == 'Architect';
      case 'Stairway':
      return action.kind == 'Architect' && !action.usedStairway;
      case 'Aqueduct':
      return action.kind == 'Patron' && !action.takenFromHand;
      case 'Bar':
      return action.kind == 'Patron' && !action.takenFromDeck;
      case 'Bath':
      return action.kind == 'Patron';
      case 'Dock':
      return action.kind == 'Laborer' && !action.takenFromHand;
      case 'Fountain':
      return action.kind == 'Craftsman';
      case 'Atrium':
      return action.kind == 'Merchant' && !action.takenFromDeck;
      case 'Basilica':
      return action.kind == 'Merchant' && !action.takenFromHand;
      case 'Bridge':
      case 'Colosseum':
      return action.kind == 'Legionary';
      case 'Wall':
      case 'Palisade':
      return action.kind == 'Rome Demands';
      case 'Palace':
      return action.kind == 'Think' || action.kind == 'Follow';
      case 'Latrine':
      case 'Vomitorium':
      return action.kind == 'Lead' || action.kind == 'Think' || action.kind == 'Follow';
      default:
      return false;
    }
  }
});