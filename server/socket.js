'use strict'

// export function for listening to the socket
module.exports = function (io) {

  return function(socket) {
    socket.on('update', function (data) {
      socket.join(data.game.room);
      if (data.ai && !data.game.finished) {
        socket.broadcast.to(data.room).emit('change', data);
          //var basic = require('../ai/basic');
          //data.move = basic(data, data.game.currentPlayer)[0];
        /*var ai = require('../ai/game.js');
        ai.getMove(data.game, function(move) {
          data.move = move;
          socket.emit('change', data);
          socket.broadcast.to(data.room).emit('change', data);
          if (gamesList.gamePlayers[data.game.room]) {
            delete gamesList.gamePlayers[data.game.room];
          }
        });*/
        while (data.game.players[data.game.currentPlayer].ai && !data.game.finished) {
          var createGame = require('../ai/game');
          var game = createGame(data.game);
          var ai = require('../ai/mcts');
          data.move = ai.getMove(game, data.game.iterations);
          var actions = require('../public/games/' + data.game.gameName + '/rules').actions;
          actions.applyMove(data.move, data.game);
          socket.emit('change', data);
          socket.broadcast.to(data.room).emit('change', data);
          if (gamesList.gamePlayers[data.game.room]) {
            delete gamesList.gamePlayers[data.game.room];
          }
        }
      } else {
        socket.broadcast.to(data.game.room).emit('change', data);
        if (gamesList.gamePlayers[data.game.room]) {
          delete gamesList.gamePlayers[data.game.room];
        }
      }
    });

    socket.on('create', function(name) {
      if (
          name.length > 0 
      &&  name.length <= 15) 
      {
        var gameid = (Math.random().toString(36)+'00000000000000000').slice(2, 8);
        while (io.sockets.adapter.rooms[gameid]) {
          gameid = (Math.random().toString(36)+'00000000000000000').slice(2, 8);
        }
        gamesList.gamePlayers[gameid] = [name];
        socket.emit('created', {gameid: gameid});
       
        socket.join(gameid);
        console.log(gameid);
      }
    });

    socket.on('add ai', function(data) {
      if (
          gamesList.gamePlayers[data.room]
      &&  io.sockets.adapter.rooms[data.room] 
      &&  Object.keys(io.sockets.adapter.rooms[data.room]).length < 5) {
        gamesList.gamePlayers[data.room].push('AI');
        socket.emit('ai joined', 'AI');
        socket.broadcast.to(data.room).emit('ai joined', 'AI');
      }
    });

    socket.on('join', function(data) {
      if (
          gamesList.gamePlayers[data.room]
      &&  io.sockets.adapter.rooms[data.room] 
      &&  Object.keys(io.sockets.adapter.rooms[data.room]).length < 5
      &&  data.name.length > 0 && data.name.length <= 15) 
      {
        socket.join(data.room);
        gamesList.gamePlayers[data.room].push(data.name);
        socket.emit('accepted', gamesList.gamePlayers[data.room]);
        socket.broadcast.to(data.room).emit('joined', data.name);
      }
    });

    // get the most recent game state
    socket.on('reconnection', function(data) {
      socket.join(data.room);
      socket.broadcast.to(data.room).emit('change', data);
    });
  };
};

// object for maintaining the list of active games
var gamesList = (function() {

  var gamePlayers = {};

  return {
    gamePlayers: gamePlayers
  };

}());

