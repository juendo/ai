'use strict'

var async = require('async');

// export function for listening to the socket
module.exports = function (io) {

  return function(socket) {
    socket.on('update', function (data) {

      socket.join(data.room);
      socket.broadcast.to(data.room).emit('change', data);
      if (gamesList.gamePlayers[data.room]) {
        delete gamesList.gamePlayers[data.room];
      }

      if (data.ai) {
        var state = data.ai;
        data.game = undefined;
        var createGame = require('../ai/game');
        var ai = require('../ai/mcts');
        var actions = require('../public/games/' + state.gameName + '/rules').actions;

        var game = createGame(state);
        data.move = ai.getMove(game, state.iterations);
        actions.applyMove(data.move, state);
        data.turn = state.turn;
        data.update = true;
        socket.emit('change', data);
        data.update = false;
        socket.broadcast.to(data.room).emit('change', data);
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
  };
};

// object for maintaining the list of active games
var gamesList = (function() {

  var gamePlayers = {};

  return {
    gamePlayers: gamePlayers
  };

}());

