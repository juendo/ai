'use strict'

// export function for listening to the socket
module.exports = function (nsp) {

  return function(socket) {

    // when a player makes a move, update is sent
    socket.on('update', function (data) {

      // make sure the player is in the room
      socket.join(data.room);
      if (gamesList.gamePlayers[data.room]) {
        delete gamesList.gamePlayers[data.room];
      }
      socket.broadcast.to(data.room).emit('change', data);

      if (data.ai && !data.ai.finished) {
        var state = data.ai;
        data.game = undefined;
        var createGame = require('../ai/game');
        var ai = require('../ai/ismcts');
        var actions = require('../public/games/' + state.gameName + '/rules').actions;

        var game = createGame(state);
        ai.getMove(game, state.iterations, function(move) {
          data.move = move;
          actions.applyMove(data.move, state);
          data.turn = state.turn;
          data.update = true;
          socket.emit('change', data);
          data.update = false;
          socket.broadcast.to(data.room).emit('change', data);
        }); 
      }
    });

    socket.on('create', function(name) {
      if (
          name.length > 0 
      &&  name.length <= 10) 
      {
        var gameid = (Math.random().toString(36)+'00000000000000000').slice(2, 8);
        while (nsp.adapter.rooms[gameid]) {
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
      &&  nsp.adapter.rooms[data.room] 
      &&  Object.keys(nsp.adapter.rooms[data.room]).length < data.max) {
        gamesList.gamePlayers[data.room].push('AI');
        socket.emit('ai joined', 'AI');
        socket.broadcast.to(data.room).emit('ai joined', 'AI');
      }
    });

    socket.on('join', function(data) {
      if (
          gamesList.gamePlayers[data.room]
      &&  nsp.adapter.rooms[data.room] 
      &&  Object.keys(nsp.adapter.rooms[data.room]).length < data.max
      &&  data.name.length > 0 && data.name.length <= 10) 
      {
        socket.join(data.room);
        gamesList.gamePlayers[data.room].push(data.name);
        socket.emit('accepted', gamesList.gamePlayers[data.room]);
        socket.broadcast.to(data.room).emit('joined', data.name);
      }
    });

    socket.on('game-over', function(data) {
      // send moves of the game to the database
      var save = require('../db/save_moves.js');
      save(data);
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

