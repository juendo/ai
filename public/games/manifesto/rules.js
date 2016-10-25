var state = {
  gameName: 'manifesto',
  players: [
    {
      hand: [],
      discard: [],
      points: 0,
      support: 0
    }
  ],
  electorate: [
    [0,0,0,0,0,0,0],
    [0,1,1,1,1,1,0],
    [0,1,1,1,1,1,0],
    [0,1,1,1,1,1,0],
    [0,1,1,1,1,1,0],
    [0,1,1,1,1,1,0],
    [0,0,0,0,0,0,0]
  ],
  campaigns: 0,
  currentPlayer: 0,
  turn: 0,
  max: 5,
};

var actions = {

  createDeck: function() {
    var deck = [];
    var nums = [1,2,3,4,5];
    nums.forEach(function(i) {
      nums.forEach(function(j) {
        deck.push({x: i, y: j});
      });
    });

    return deck;
  },

  score: function(player) {
    //console.log('score');
    //console.log(player);
    return player.points;
  },

  winner: function(state) {
    
    var maxScore = 0;
    var winner = [];
    for (var i = 0; i < state.players.length; i++) {
      var score = this.score(state.players[i]);
      if (score > maxScore) {
        maxScore = score;
        winner = [i]
      } else if (score === maxScore) {
        winner.push(i);
      }
    }

    var maxSupport = -1;
    var w = [];
    for (var i = 0; i < winner.length; i++) {
      var support = state.players[winner[i]].support;
      if (support > maxSupport) {
        maxSupport = support;
        w = [winner[i]];
      } else if (support === maxSupport) {
        w.push(winner[i]);
      }
    }
    return w;
  },

  start: function(game) {

    if (game.players.length < 3) return false;
    game.started = true;

    var deck = this.shuffle(this.createDeck());

    game.players.forEach(function(player) {
      [0,1,2,3,4,5].forEach(function() {
        player.hand.push(deck.pop());
      });
    });

    game.startPlayer = Math.floor(Math.random() * game.players.length);
    game.currentPlayer = game.startPlayer;
    
    return game;
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

  checkIfGameOver: function(game) {
    return game.finished;
  },

  ///////////////// MOVES ///////////////////////////////

  policy: function(move, game) {
    // card goes into discard
    var player = game.players[game.currentPlayer];
    var card = player.hand[move.card];
    player.discard.push(card);
    player.hand.splice(move.card, 1);

    game.electorate[card.x][card.y]++;

    // rearrange electorate according to card
    // left
    if (card.x > 1) {
      for (var i = card.x; i > 1; i--) {
        game.electorate[i][card.y] += game.electorate[i - 1][card.y];
        game.electorate[i - 1][card.y] = 0;
      }
    }
    // right
    if (card.x < 6) {
      for (var i = card.x; i < 5; i++) {
        game.electorate[i][card.y] += game.electorate[i + 1][card.y];
        game.electorate[i + 1][card.y] = 0;
      }
    }
    // up
    if (card.y < 6) {
      for (var i = card.y; i < 5; i++) {
        game.electorate[card.x][i] += game.electorate[card.x][i + 1];
        game.electorate[card.x][i + 1] = 0;
      }
    }
    // down
    if (card.y > 1) {
      for (var i = card.y; i > 1; i--) {
        game.electorate[card.x][i] += game.electorate[card.x][i - 1];
        game.electorate[card.x][i - 1] = 0;
      }
    }

    // turn passes to next player
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;

    return game;
  },

  campaign: function(move, game) {

    var player = game.players[game.currentPlayer];

    var nums = [1,2,3,4,5];
    nums.forEach(function(i) {
      nums.forEach(function(j) {
        if (!game.electorate[i][j]) game.electorate[i][j] = 1;
      });
    });

    // score each discard
    player.discard.forEach(function(card) {
      //player.points += game.electorate[card.x][card.y];
      player.hand.push(card);
    });
    player.discard = [];

        // turn passes to next player
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;

    return game;
  },

  refute: function(move, game) {

    var player = game.players[game.currentPlayer];

    var card = game.players[move.player].discard[move.card];
    game.players[move.player].hand.push(card);
    player.discard.splice(move.card, 1);

    game.electorate[card.x][card.y]++;

    // rearrange electorate according to card
    // left
    if (card.x > 1) {
      for (var i = 0; i < card.x - 1; i++) {
        game.electorate[i][card.y] += game.electorate[i + 1][card.y];
        game.electorate[i + 1][card.y] = 0;
      }
    }
    // right
    if (card.x < 6) {
      for (var i = 6; i > card.x + 1; i--) {
        game.electorate[i][card.y] += game.electorate[i - 1][card.y];
        game.electorate[i - 1][card.y] = 0;
      }
    }
    // up
    if (card.y < 6) {
      for (var i = 6; i > card.y + 1; i--) {
        game.electorate[card.x][i] += game.electorate[card.x][i - 1];
        game.electorate[card.x][i - 1] = 0;
      }
    }
    // down
    if (card.y > 1) {
      for (var i = 0; i < card.y - 1; i++) {
        game.electorate[card.x][i] += game.electorate[card.x][i + 1];
        game.electorate[card.x][i + 1] = 0;
      }
    }

    // turn passes to next player
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;

    game.campaigns++;

    if (game.campaigns >= game.players.length * 8) {
      game.finished = true;

      game.players[0].support += game.electorate[0][5] + game.electorate[0][4] + game.electorate[1][6] + game.electorate[2][6] + game.electorate[3][6];
      game.players[1].support += game.electorate[4][6] + game.electorate[5][6] + game.electorate[6][5] + game.electorate[6][4] + game.electorate[6][3];
      game.players[2].support += game.electorate[6][2] + game.electorate[6][1] + game.electorate[5][0] + game.electorate[4][0] + game.electorate[3][0];
      game.players[3].support += game.electorate[2][0] + game.electorate[1][0] + game.electorate[0][1] + game.electorate[0][2] + game.electorate[0][3];

      var addPoints = function(x1, y1, x2, y2, p1, p2) {
        if (game.electorate[x1][y1] > game.electorate[x2][y2])
          game.players[p1].points++;
        else if (game.electorate[x1][y1] < game.electorate[x2][y2])
          game.players[p2].points++;
        else if (game.players[p1].support > game.players[p2].support)
          game.players[p1].points++;
        else if (game.players[p1].support < game.players[p2].support)
          game.players[p2].points++;
      }

      addPoints(0,5,6,5,0,1);
      addPoints(0,4,6,4,0,1);
      addPoints(0,3,6,3,3,1);
      addPoints(0,2,6,2,3,2);
      addPoints(0,1,6,1,3,2);
      addPoints(1,0,1,6,3,0);
      addPoints(2,0,2,6,3,0);
      addPoints(3,0,3,6,2,0);
      addPoints(4,0,4,6,2,1);
      addPoints(5,0,5,6,2,1);

    }
    

    return game;
  },

  determinise: function(state) {

    // IMPLEMENT ME
    // shuffle deck and player hands and hidden traits
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