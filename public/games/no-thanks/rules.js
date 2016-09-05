// this file contains code to apply moves

var state = {
  gameName: 'no-thanks',
  iterations: 1000,
  players: [
    {
      chips: 11,
      cards: []
    }
  ],
  deck: [],
  currentCard: {
    value: 0,
    chips: 0
  },
  currentPlayer: 0,
  turn: 0,
  max: 5
};

var actions = {

  winner: function(state) {
    var minScore = 1000;
    var winner = [];
    var l = state.players.length;
    for (var i = 0; i < l; i++) {
      var score = this.score(state.players[i]);
      if (score < minScore) {
        minScore = score;
        winner = [i];
      } else if (score === minScore) {
        winner.push(i);
      }
    }
    return winner;
  },

  shuffle: function(array) {
    var m = array.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
    return array;
  },

  start: function(game) {

    if (game.players.length < 3) return false;

    for (var i = 3; i <= 35; i++) {
       game.deck.push(i);
    }

    game.deck = this.shuffle(game.deck).splice(0, 26);

    game.currentCard = {
      chips: 0,
      value: game.deck.pop()
    };

    game.started = true;
    game.turn = 0;
    return game;
  },

  score: function(player) {

    var score = 0;

    var prev = 0;
    for (var i = 0; i < player.cards.length; i++) {
      if (player.cards[i] - prev !== 1) score += player.cards[i];
      prev = player.cards[i];
    }
    
    return score - player.chips;
  },

  checkIfGameOver: function(game) {
    game.finished = !game.deck.length;
    return game.finished;
  },

  ///////////////// MOVES ///////////////////////////////

  take: function(move, game, player) {

    var added = false;
    for (var i = 0; i < player.cards.length; i++) {
      if (game.currentCard.value < player.cards[i]) {
        player.cards.splice(i, 0, game.currentCard.value);
        added = true;
        break;
      }
    }
    if (!added) player.cards.push(game.currentCard.value);
    player.chips += game.currentCard.chips;
    game.currentCard = {
      value: game.deck.pop(),
      chips: 0
    }
    return game;
  },

  chip: function(move, game, player) {

    if (player.chips) {
      player.chips--
      game.currentCard.chips++;
      game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
      return game;
    } 
    else return false; 
  },

  determinise: function(state) {
    var seen = [];
    for (var i = 3; i <= 35; i++) {
       seen.push(false);
    }
    state.players.forEach(function(player) {
      player.cards.forEach(function(card) {
        seen[card - 3] = true;
      });
    });
    var unseen = [];
    for (var i = 3; i <= 35; i++) {
      if (!seen[i - 3]) unseen.push(i);
    }
    state.deck = this.shuffle(unseen).splice(0, state.deck.length);

    return state;
  }
};

if (typeof module !== 'undefined') { 
  actions.applyMove = function(move, game) {
    
    var newState = actions[move.kind](move, game, game.players[game.currentPlayer]);

    if (newState) {
      actions.checkIfGameOver(newState);
      game.turn++;
    }
    
    return newState;
  }
  module.exports.actions = actions;
  module.exports.state = state;
}