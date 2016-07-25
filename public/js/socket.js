angular.module('Game', ['Game.directives', 'ngDraggable']);

if (typeof io !== 'undefined') angular.module('Game').factory('socket', function ($rootScope, actions) {
  
  var iosocket = io.connect();
  var socket = {
    on: function (eventName, callback) {
      iosocket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(iosocket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      iosocket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(iosocket, args);
          }
        });
      })
    }
  };

  var ding = new Audio('../audio/bell.m4a');
  $rootScope.ding = ding;

  var update = function(game) {

    var data = {
      turn: $rootScope.game.turn,
      move: $rootScope.game.moves[$rootScope.game.moves.length - 1],
      room: $rootScope.game.room,
    };

    if ($rootScope.game.players[$rootScope.game.currentPlayer].ai) data.ai = JSON.parse(angular.toJson($rootScope.game));
    if (game) data.game = game;

    socket.emit('update', data);
  }

  // message received indicating that another player has acted
  socket.on('change', function (data) {

    if (data.turn < $rootScope.game.turn) return update($rootScope.game);

    else if (data.turn > $rootScope.game.turn && !data.game) {
      actions.applyMove(data.move, $rootScope.game);
    } 

    else if (data.game) {
      $rootScope.game.started = true;
      $rootScope.game = data.game;
    }
    
    if ($rootScope.game.currentPlayer === $rootScope.meta.you) ding.play();
  });

  // when the game is first created
  socket.on('created', function (data) {
    $rootScope.game.room = data.gameid;
  });

  // when you are accepted into an existing game
  socket.on('accepted', function(players) {
    $rootScope.game.players = players.map(function(name) {
      var player = JSON.parse(JSON.stringify($rootScope.game.players[0]));
      player.name = name;
      player.ai = name === 'AI';
      return player;
    });
    $rootScope.meta.you = players.length - 1;
    $rootScope.game.created = true;
  });

  // when another player joins your game
  socket.on('joined', function(name) {
    var player = JSON.parse(JSON.stringify($rootScope.game.players[0]));
    player.name = name;
    $rootScope.game.players.push(player);
  });

  socket.on('ai joined', function(name) {
    var player = JSON.parse(JSON.stringify($rootScope.game.players[0]));
    player.name = name;
    player.ai = true;
    $rootScope.game.players.push(player);
  });

  socket.on('reconnect', function() {
    update($rootScope.game);
  });

  return {
    update: update,
    on: socket.on,
    emit: socket.emit
  }
});
