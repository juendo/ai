angular.module('Game').controller('GameController', function($scope, socket, actions) {

  $scope.actions = actions;

  // called when a card in your hand is clicked
  $scope.handClicked = function(player, game, data, action) {

    if (action == 'Rome Demands') 
      var move = {kind: 'romeDemands', data: data};
    else if (action == 'Legionary') 
      var move = {kind: 'legionary', data: data};
    else if (action == 'Patron') 
      var move = {kind: 'aqueduct', data: data};
    else if (action == 'Laborer') 
      var move = {kind: 'dock', data: data};
    else if (action == 'Merchant') 
      var move = {kind: 'basilica', data: data};

    else if (action == 'Lead' || action == 'Follow')
      data.card.selected = !data.card.selected;
    else if ((action == 'Craftsman' || action == 'Architect') && data.card.name != 'Jack') {
      if (data.card.selected && !player.actions[0].usedFountain) {
        data.card.selected = false;
      } else if (!player.actions[0].usedFountain) {
        player.hand.forEach(function(card) {
          card.selected = false;
        });
        data.card.selected = true;
      }
    }

    if ((typeof move !== 'undefined') && actions.applyMove(move, game)) socket.update(); 
  }

  // called when the deck is clicked (and you are the current player)
  $scope.deckClicked = function(action, game) {

    if (action == 'Lead' || action == 'Follow' || action == 'Think') 
      var move = {kind: 'refill'};
    else if (action == 'Merchant') 
      var move = {kind: 'atrium'};
    else if (action == 'Patron') 
      var move = {kind: 'bar'};
    else if (action == 'Craftsman') 
      var move = {kind: 'fountain'};

    if ((typeof move !== 'undefined') && actions.applyMove(move, game)) socket.update();
  }

  $scope.drawOne = function(action, game) {

    if (action == 'Lead' || action == 'Follow' || action == 'Think') {
      var move = {kind: 'drawOne'};
    }

    if ((typeof move !== 'undefined') && actions.applyMove(move, game)) socket.update();
  }

  $scope.skipAction = function(player, game, action) {

    if (action == 'Rome Demands')
      game.glory = player;
    else if (action == 'Craftsman') {
      player.hand.forEach(function(card) {
        card.selected = false;
      });
    }

    if (actions.applyMove({kind: 'skip'}, game)) socket.update();
  }

  $scope.jackClicked = function(action, game) {

    if (action == 'Lead' || action == 'Follow' || action == 'Think')
      var move = {kind: 'takeJack'};

    if ((typeof move !== 'undefined') && actions.applyMove(move, game)) socket.update();
  }

  // called when a drag ends over a structure
  $scope.dragEnded = function(action, data, game, index, playerIndex) {

    if (data.card && action == 'Craftsman')
      var move = {kind: 'fillFromHand', building: index, data: data};
    else if (data.material && action == 'Architect')
      var move = {kind: 'fillFromStockpile', building: index, data: data, player: playerIndex};
    else if (data.color && action == 'Architect')
      var move = {kind: 'fillFromPool', building: index, color: data.color, player: playerIndex};

    if ((typeof move !== 'undefined') && actions.applyMove(move, game)) socket.update();
  }

  // called when a space in the pool is clicked
  $scope.poolClicked = function(player, color, game, action) {

    var cards = [];
    for (var i = 0; i < player.hand.length; i++) {
      if (player.hand[i].selected) {
        cards.push(i);
      }
    }

    if (action == 'Lead')
      var move = {kind: 'lead', cards: cards, role: color};
    else if (action == 'Patron')
      var move = {kind: 'patron', color: color};
    else if (action == 'Laborer')
      var move = {kind: 'laborer', color: color};
    else if (action == 'Follow')
      var move = {kind: 'follow', cards: cards};
    else if (cards.length === 1 && (action == 'Craftsman' || action == 'Architect'))
      var move = {kind: 'lay', index: cards[0], color: color};

    if ((typeof move !== 'undefined') && actions.applyMove(move, game)) socket.update();
  }

  // called when a material in your stockpile is clicked
  $scope.stockpileClicked = function(action, data, game) {

    if (action == 'Merchant')
      var move = {kind: 'merchant', data: data};

    if ((typeof move !== 'undefined') && actions.applyMove(move, game)) socket.update();
  }

  $scope.pendingClicked = function(action, data, game) {

    if (action == 'Sewer')
      var move = {kind: 'sewer', data: data};

    if ((typeof move !== 'undefined') && actions.applyMove(move, game)) socket.update();
  }

  $scope.buildingClicked = function(action, building, isYours, opponent, index, game) {

    if ((action == 'Lead' || action == 'Think' || action == 'Follow') && building.name == 'Vomitorium' && isYours)
      var move = {kind: 'vomitorium'};
    else if (action == 'Prison' && !isYours)
      var move = {kind: 'prison', building: building, opponent: opponent, index: index};

    if ((typeof move !== 'undefined') && actions.applyMove(move, game)) socket.update();
  }

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
})