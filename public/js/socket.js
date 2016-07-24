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


  var update = function() {
   
    socket.emit('update', {
      game: JSON.parse(angular.toJson($rootScope.game)),
      ai: $rootScope.game.players[$rootScope.game.currentPlayer].ai
    });
  }

  // message received indicating that another player has acted
  socket.on('change', function (data) {
    if (data.game.turn < $rootScope.game.turn) return update();
    if (data.game.turn === $rootScope.game.turn && data.game.turn > 1 && !data.move) {
      return;
    };
    $rootScope.game.started = true;
    $rootScope.game = data.game;

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

  // if reconnecting, request missed data from server
  socket.on('reconnect', function() {
    socket.emit('reconnection', {
      game: $rootScope.game
    });
  });

  return {
    update: update,
    on: socket.on,
    emit: socket.emit
  }
});
