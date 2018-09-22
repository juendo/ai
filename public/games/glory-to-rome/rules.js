var state = {
  gameName: 'glory-to-rome',
  iterations: 250,
  players: [
    {
      name: "",
      buildings: [],
      hand: [],
      stockpile: [],
      clientele: [],
      vault: [],
      // a list of the actions the player has yet to use this turn
      actions: [],
      // the cards the player used to lead or follow
      pending: [],
      publicBuildings: []
    }
  ],
  pool: {
    'yellow': 0,
    'green': 0,
    'red': 0,
    'grey': 0,
    'purple': 0,
    'blue': 0,
    // the number of jacks available
    'black': 6
  },
  deck: [],
  sites: {
      'yellow': 6,
      'green': 6,
      'red': 6,
      'grey': 6,
      'purple': 6,
      'blue': 6
  },
  leader: 0,
  turn: 0,
  currentPlayer: 0,
  max: 5
};

var actions = {

  winner: function(state) {

    var maxScore = 0;
    var maxHand = -1;
    var winner = [];
    var forums = [];
    var l = state.players.length;
    for (var i = 0; i < l; i++) {
      var score = this.score(state.players[i]);
      var hand = state.players[i].hand.length;
      if ((score > maxScore) || (score === maxScore && hand > maxHand)) {
        maxScore = score;
        maxHand = hand;
        winner = [i];
      } else if (score === maxScore && hand === maxHand) {
        winner.push(i);
      }
      if (state.players[i].winner) forums.push(i);
    }
    return !forums.length ? winner : forums;
  },

  roles: { 
    'yellow' : 'Laborer',
    'green' : 'Craftsman',
    'grey' : 'Architect',
    'red' : 'Legionary',
    'purple' : 'Patron',
    'blue' : 'Merchant'
  },

  roleColors: { 
    'Laborer' : 'yellow',
    'Craftsman' : 'green',
    'Architect' : 'grey',
    'Legionary' : 'red',
    'Patron' : 'purple',
    'Merchant' : 'blue'
  },

  materials: { 
    'yellow' : 'rubble',
    'green' : 'wood',
    'grey' : 'concrete',
    'red' : 'brick',
    'purple' : 'marble',
    'blue' : 'stone'
  },

  colorValues: { 
    'blank' : 0,
    'yellow' : 1,
    'green' : 1,
    'grey' : 2,
    'red' : 2,
    'purple' : 3,
    'blue' : 3
  },

  buildingColors: {
    'Academy': 'red',
    'Amphitheatre': 'grey',
    'Aqueduct': 'grey',
    'Archway': 'red',
    'Atrium': 'red',
    'Bar': 'yellow',
    'Basilica': 'purple',
    'Bath': 'red',
    'Bridge': 'grey',
    'Catacomb': 'blue',
    'CircusMaximus': 'blue',
    'Circus': 'green',
    'Dock': 'green',
    'Colosseum': 'blue',
    'Forum': 'purple',
    'Foundry': 'red',
    'Fountain': 'purple',
    'Garden': 'blue',
    'Gate': 'red',
    'Insula': 'yellow',
    'Latrine': 'yellow',
    'LudusMagnus': 'purple',
    'Market': 'green',
    'Palace': 'purple',
    'Palisade': 'green',
    'Prison': 'blue',
    'Road': 'yellow',
    'School': 'red',
    'Scriptorium': 'blue',
    'Sewer': 'blue',
    'Shrine': 'red',
    'Stairway': 'purple',
    'Statue': 'purple',
    'Storeroom': 'grey',
    'Temple': 'purple',
    'Tower': 'grey',
    'Senate': 'grey',
    'Villa': 'blue',
    'Vomitorium': 'grey',
    'Wall': 'grey'
  },

  start: function(game) {

    if (game.players.length < 2) return false;
    game.turn = 0;
    game.started = true;
    game.deck = this.createDeck();
    for (var i = 0; i < game.players.length; i++) {
      game.pool[this.buildingColors[game.deck.pop()]]++;
      while (game.players[i].hand.length < 4) {
        var name = game.deck.pop();
        game.players[i].hand.push({name: name, done: false, materials: [], selected: false, color: this.buildingColors[name]});
      }
      game.players[i].hand.push({name: 'Jack', color: 'black', selected: false});
      game.pool['black']--;
    }
    game.leader = Math.floor(Math.random() * (game.players.length));
    game.currentPlayer = game.leader;
    game.players[game.currentPlayer].actions.push({kind:'Lead', description:'LEAD or THINK'});
    // REMOVE BELOW
    game.players[0].buildings.push({name:'Stairway', done:true, color:'purple', siteColor:'purple', materials: ['purple', 'purple', 'purple']});
    return game;
  },

  addThinkIfPlayerHasAcademy: function(player, action) {
    // check if player has an academy
    var academy = this.hasAbilityToUse('Academy', player);
    if (
          academy 
      && !player.usedAcademy
      &&  action.kind == 'Craftsman') 
    {
      player.actions.push({kind: 'Think', description: 'THINK', skippable: true});
      player.usedAcademy = true;
    }
  },

  checkLatrine: function(player, pool) {
    // extract the cards the player has selected

    var latrine = this.hasAbilityToUse('Latrine', player);

    if (!latrine) return false;

    var selectedCards = [];
    var index = 0;
    var location = 0;
    player.hand.forEach(function(card) {
      card.selected ? selectedCards.push(card) : null;
      card.selected ? location = index++ : index++;
    }, this);

    if (selectedCards.length > 1) return false;
    else if (selectedCards.length == 0) return false;
    else if (selectedCards.length == 1) {
      player.hand.splice(location, 1);
      pool[selectedCards[0].color]++;
      return true;
    }
  },

  hasAbilityToUse: function(building, player) {
    // check public buildings first
    var hasGate = false;
    if (player.publicBuildings) {
      var isPublic = false;
      player.publicBuildings.forEach(function(pb) {
        if (pb === building) isPublic = true;
        else if (pb === 'Gate') hasGate = true;
      });
      if (isPublic) return true;
    }
    player.buildings.forEach(function(structure) {
      if (structure.done && structure.name == 'Gate') hasGate = true;
    }, this);
    var has = null;
    player.buildings.forEach(function(structure) {
      if ((structure.done || (structure.color == 'purple' && hasGate)) && structure.name == building) has = structure;
    }, this);
    return has;
  },

  hasAbilityToUseWithoutPublicBuildings: function(building, player) {
    var hasGate = false;
    player.buildings.forEach(function(structure) {
      if (structure.done && structure.name == 'Gate') hasGate = true;
    }, this);
    var has = null;
    player.buildings.forEach(function(structure) {
      if ((structure.done || (structure.color == 'purple' && hasGate)) && structure.name == building) has = structure;
    }, this);
    return has;
  },

  jackNum: function(player) {
    var jacks = 0;
    player.hand.forEach(function(card) {
      if (card.name === 'Jack')
        jacks++;
    });
    return jacks;
  },

  score: function(player) {
    var vaultPoints = 0;
    player.vault.forEach(function(material) {
      vaultPoints += this.colorValues[material.color];
    }, this);
    var wallPoints = this.hasAbilityToUse('Wall', player) ? player.stockpile.length / 2 >> 0 : 0;
    var statuePoints = this.hasAbilityToUse('Statue', player) ? 3 : 0;
    return this.influence(player) + wallPoints + statuePoints + vaultPoints + player.merchantBonus;
  },

  handLimit: function(player) {
    var limit = 5;
    if (this.hasAbilityToUse('Shrine', player)) limit += 2;
    if (this.hasAbilityToUse('Temple', player)) limit += 4;
    return limit;
  },

  validSelection: function(player, selectedCards, color) {
    var palace = this.hasAbilityToUse('Palace', player);
    var jackLength = this.hasAbilityToUse('Circus', player) ? 2 : 3;
    if (!palace) {
      if (selectedCards.length == 0) {
        return false;
      }
      if (selectedCards.length == 1 && selectedCards[0].color == color) {
        return true;
      }
      if (selectedCards.length == 1 && selectedCards[0].name == 'Jack') {
        return true;
      }
      var allSame = true;
      var firstColor = selectedCards[0].color;
      selectedCards.forEach(function(card) {
        allSame = allSame && card.color == firstColor;
      });
      if (!allSame) {
        return false;
      }
      return (selectedCards.length == jackLength);
    } 
    else {
      var counts = {};
      selectedCards.forEach(function(card) {
        if (!counts[card.color]) counts[card.color] = 1;
        else counts[card.color]++;
      });
      var extraActions = 0;
      for (var key in counts) {
        if (key == 'black' || key == color) extraActions += counts[key];
        else if (counts[key] % jackLength != 0) return false;
        else extraActions += counts[key] / jackLength;
      }
      for (var i = 0; i < extraActions - 1; i++) {
        player.actions.push({kind: this.roles[color], description: this.roles[color].toUpperCase()});
      }
      return true;
    }
  },

  canAddToStructure: function(structure, player, color, game, action, owner) {

    //console.log('can add');
    //console.log(owner);
    
    var stairway = this.hasAbilityToUse('Stairway', player);
    //console.log(stairway);
    // check if structure belongs to the player
    var belongsToPlayer = (typeof owner !== 'undefined') ? (game.players[owner] === player) : true;

    //console.log(belongsToPlayer);

    if (!belongsToPlayer && (!stairway || !structure.done || (action && action.usedStairway))) return false;
    if (belongsToPlayer && (action && action.usedRegularArchitect)) return false;

    var canAdd = (structure.siteColor === color 
                || this.hasAbilityToUse('Scriptorium', player) && color === 'purple'
                || this.hasAbilityToUse('Road', player) && structure.siteColor === 'blue'
                || this.hasAbilityToUse('Tower', player) && color === 'yellow');

    if (stairway && !belongsToPlayer) {

      if (!structure.done || !canAdd) return false;

      var alreadyPublic = false;

      game.players.forEach(function(p) {
        if (p.publicBuildings) {
          var containsIt = false;
          p.publicBuildings.forEach(function(b) {
            if (b == structure.name) containsIt = true;
          });
          if (!containsIt) {
            p.publicBuildings.push(structure.name);
          } else {
            alreadyPublic = true;
          }
        } else {
          p.publicBuildings = [structure.name];
        }
      });

      var ok = !!canAdd && !alreadyPublic;
      if (ok) {
        action.usedStairway = true;
      }
      //console.log(ok);
      return ok;
    } else {

      var ok = !!canAdd && !structure.done;
      if (ok) {
        action.usedRegularArchitect = true;
      }
      return ok;
    }
  },

  checkIfComplete: function(structure, player, game, actionType) {
    if (!structure.done 
        && (structure.materials.length >= this.colorValues[structure.siteColor] 
          || (this.hasAbilityToUse('Scriptorium', player) && structure.materials[structure.materials.length - 1] == 'purple')
          || (structure.name == 'Villa' && actionType == 'Architect'))) {
      structure.done = true;
      if (structure.name == 'Amphitheatre') {
        for (var i = 0; i < this.influence(player); i++) {
          player.actions.splice(1, 0, {kind: 'Craftsman', description: 'CRAFTSMAN'});
        }
      } 
      else if (structure.name == 'Catacomb') {
        game.finished = true;
      }
      else if (structure.name == 'Foundry') {
        for (var i = 0; i < this.influence(player); i++) {
          player.actions.splice(1, 0, {kind: 'Laborer', description: 'LABORER'});
        }
      }
      else if (structure.name == 'Garden') {
        for (var i = 0; i < this.influence(player); i++) {
          player.actions.splice(1, 0, {kind: 'Patron', description: 'PATRON'});
        }
      }
      else if (structure.name == 'School') {
        for (var i = 0; i < this.influence(player); i++) {
          player.actions.splice(1, 0, {kind: 'Think', description: 'THINK', skippable: true});
        }
      }
      else if (structure.name == 'CircusMaximus'
            && player.pending.length > 0) {
        if (!player.doubledClients) this.addClientActions(player, game.currentAction);
      }
      else if (structure.name == 'Prison') {
        player.actions.splice(1, 0, {kind: 'Prison', description: 'STEAL BUILDING'});
      }
    }
  },

  addClientActions: function(player, color) {

    player.clientele.forEach(function(client) {
      if (this.roles[color] == client) {
        player.actions.push({kind: client, description: client.toUpperCase()});
      } else if (this.hasAbilityToUse('Storeroom', player) && color == 'yellow') {
        player.actions.push({kind: 'Laborer', description: 'LABORER'});
      } else if (this.hasAbilityToUse('LudusMagnus', player) && client == 'Merchant') {
        player.actions.push({kind: this.roles[color], description: this.roles[color].toUpperCase()})
      }
    }, this);
  },

  vaultLimit: function(player) {
    var limit = this.influence(player);
    if (this.hasAbilityToUse('Market', player)) limit += 2;
    return limit;
  },

  clienteleLimit: function(player) {
    var limit = this.influence(player);
    if (this.hasAbilityToUse('Insula', player)) limit += 2;
    if (this.hasAbilityToUse('Aqueduct', player)) limit = limit * 2;
    return limit;
  },

  influence: function(player) {
    var inf = 2;
    if (player.influenceModifier) inf += player.influenceModifier;
    player.buildings.forEach(function(building) {
      if (building.done && !building.stolen) {
        inf += this.colorValues[building.siteColor];
      }
    }, this);
    return inf;
  },

  allSitesUsed: function(sites, length) {
    var used = true;
    for (var color in sites) {
      used = used && (6 - sites[color] >= length);
    }
    return used;
  },

  meetsForumCriteria: function(player) {
    if (!this.hasAbilityToUse('Forum', player)) return false;
    var has = {};
    for (var role in this.roles) {
      has[role] = 0;
      player.clientele.forEach(function(client) {
        if (client == this.roles[role]) {
          has[role]++;
        }
      }, this);
    }
    var storeroom = this.hasAbilityToUse('Storeroom', player);
    var ludusMagnus = this.hasAbilityToUse('LudusMagnus', player);

    if (!storeroom && !ludusMagnus) {
      return !!has['yellow'] && !!has['green'] && !!has['red'] && !!has['grey'] && !!has['purple'] && !!has['blue'];
    } else if (storeroom && !ludusMagnus) {
      return !!has['green'] && !!has['red'] && !!has['grey'] && !!has['purple'] && !!has['blue'];
    } else if (!storeroom && ludusMagnus) {
      return !has['yellow'] + !has['green'] + !has['red'] + !has['grey'] + !has['purple'] < has['blue'];
    } else {
      return !has['green'] + !has['red'] + !has['grey'] + !has['purple'] < has['blue'];
    }
  },

  checkIfGameOver: function(game) {

    // check if any player meets the critera for a forum victory
    game.players.forEach(function(player) {
      player.merchantBonus = 0;
      player.winner = false;
      if (this.meetsForumCriteria(player)) {
        game.finished = true;
        player.winner = true;
      }
    }, this);
    if (!game.deck.length) game.finished = true;
    if (game.finished) {
      // for each material type
      for (var role in this.roles) {
        var max = 0;
        var maxIndex = -1;
        for (var i = 0; i < game.players.length; i++) {
          var count = 0;
          game.players[i].vault.forEach(function(material) {
            if (material.color == role) {
              count++;
            }
          });
          if (count > max) {
            maxIndex = i;
            max = count;
          } else if (count == max) {
            maxIndex = -1;
          }
        }
        if (maxIndex >= 0) {
          game.players[maxIndex].merchantBonus += 3;
        }
      }
    }
    return game.finished;
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

  createDeck: function() {

    var deck = ['Academy','Amphitheatre','Aqueduct','Archway','Atrium','Bar','Bar','Basilica','Bath','Bridge','Catacomb','CircusMaximus','Circus','Circus','Dock','Dock','Colosseum','Forum','Foundry','Fountain','Garden','Gate','Insula','Insula','Latrine','Latrine','LudusMagnus','Market','Market','Palace','Palisade','Palisade','Prison','Road','Road','School','Scriptorium','Sewer','Shrine','Stairway','Statue','Storeroom','Temple','Tower','Senate','Villa','Vomitorium','Wall'];
    // helper to shuffle the deck
    return this.shuffle(deck.concat(deck).concat(deck));
  },

  // sets the current player to the next player with actions, 
  // or advances to the next turn if there is none
  nextToAct: function(game) {

    game.players[game.currentPlayer].hand.forEach(function(card) {
      card.selected = false;
    }, this);

    var current = game.currentPlayer;
    var players = game.players;
    // for each player after the current player
    for (var i = current + 1; i <= current + players.length; i++) {
      // if that player has an action, it is them to play
      if (players[i % players.length].actions[0] != undefined) {
        game.currentPlayer = i % players.length;
        return game;
      }
    }

    // move on the leader
    game.leader = (game.leader + 1) % players.length;
    game.currentPlayer = game.leader;
    players[game.currentPlayer].actions.push({kind:'Lead', description:'LEAD or THINK'});

    // check for senates and pass on jacks
    for (var i = 0; i < game.players.length; i++) {
      game.players[i].doubledClients = false;
      for (var j = 0; j < game.players[i].pending.length; j++) {
        if (game.players[i].pending[j].name == 'Jack') {
          for (var k = (i + 1) % game.players.length; k != i; k = (k + 1) % game.players.length) {
            if (this.hasAbilityToUse('Senate', game.players[k])) {
              var card = game.players[i].pending.splice(j, 1)[0];
              card.selected = false;
              game.players[k].hand.push(card);
              j--;
              break;
            }
          }
        }
      }
    }
    game.players.forEach(function(player) {
      player.pending.forEach(function(card) {
        game.pool[card.color]++; 
      });
      player.pending = [];
    });


    return game;
  },


  // ACTIONS

  vomitorium: function(move, game, player) {
    var vom = this.hasAbilityToUse('Vomitorium', player);
    if (vom) {
      var cards = player.hand;
      player.hand = [];
      cards.forEach(function(card) {
        game.pool[card.color]++;
      });
      player.actions[0].description = 'THINK';
      return game;
    }
    else return false;
  },

  romeDemands: function(move, game, player) {
    var data = move.data;
    var action = player.actions[0];
    if (data.card.color == action.material && data.card.name !== 'Jack') {
      player.hand.splice(data.index, 1);
      game.players[action.demander].stockpile.push(data.card.color);
      return this.skip(move, game, player);
    } else {
      return false;
    }
  },

  legionary: function(move, game, player) {
    var data = move.data;
    var action = player.actions[0];
    var card = player.hand[data.index];
    if (card.selected || card.name === 'Jack') {
      return false;
    }
    card.shown = true;
    player.madeDemand = true;
    var bridge = this.hasAbilityToUse('Bridge', player);
    var colosseum = this.hasAbilityToUse('Colosseum', player);
    var color = card.color;
    if (game.pool[color] > 0) {
      game.pool[color]--;
      player.stockpile.push(color);
    }
    for (var i = (game.currentPlayer + 1) % game.players.length; i != game.currentPlayer; i = (i + 1) % game.players.length) {
      if (bridge || i === (game.currentPlayer + game.players.length - 1) % game.players.length || i === ((game.currentPlayer + 1) % game.players.length)) {
        game.players[i].actions.splice(0, 0, {kind:'Rome Demands', description:'ROME DEMANDS ' + this.materials[color].toUpperCase(), demander: game.currentPlayer, material: color})
        var palisade = this.hasAbilityToUse('Palisade', game.players[i]);
        var wall = this.hasAbilityToUse('Wall', game.players[i]);
        if (bridge && !wall) {
          // loop through that player's stockpile and take a material if one matches
          for (var j = 0; j < game.players[i].stockpile.length; j++) {
            if (game.players[i].stockpile[j] == color) {
              player.stockpile.push(game.players[i].stockpile.splice(j, 1)[0]);
              break;
            }
          }
        }
        if (colosseum && !wall && (bridge || !palisade)) {
          // loop through clientele and take if matches and have space
          for (var j = 0; j < game.players[i].clientele.length; j++) {
            if (this.roles[color] == game.players[i].clientele[j] && player.vault.length < this.vaultLimit(player)) {
              player.vault.push({visibility: 'public', color: this.roleColors[game.players[i].clientele.splice(j, 1)[0]]});
              break;
            }
          }
        }
      }
    }
    card.selected = true;
    return this.skip(move, game, player);
  },

  lay: function(move, game, player) {
    var color = move.color;
    var action = player.actions[0];
    var index = move.index;
    // find the index of the single selected card the player has
    var card = player.hand[index];

    if (card.color !== color && card.name !== 'Statue') {
      return false;
    }

    var data = {index: index, card: card, color: color};

    return this.layFoundation(player, game, data, action, move);
  },

  lead: function(move, game, player) {

    var action = player.actions[0];
    var cards = move.cards
    var color = move.role;

    var selectedCards = [];
    for (var i = 0; i < cards.length; i++) {
      selectedCards.push(player.hand[cards[i]]);
      player.hand[cards[i]].selected = true;
    }

    // check if that selection can be used to lead the selected role
    if (!this.validSelection(player, selectedCards, color)) {
      return false;
    }

    // perform the lead action
    player.actions.push({kind: this.roles[color], description: this.roles[color].toUpperCase()});
    this.addClientActions(player, color);
    if (this.hasAbilityToUse('CircusMaximus', player)) {
      this.addClientActions(player, color);
      player.doubledClients = true;
    }
    player.pending = selectedCards;

    for (var i = 0; i < game.players.length; i++) {
      if (i != game.currentPlayer) {
        game.players[i].actions.push({
          kind:'Follow',
          description:'THINK or FOLLOW',
          color: color
        })
        this.addClientActions(game.players[i], color);
      }
    }
    for (var i = 0; i < player.hand.length; i++) {
      if (player.hand[i].selected) {
        player.hand.splice(i--, 1);
      }
    }
    game.currentAction = color;
    return this.skip(move, game, player);
  },

  follow: function(move, game, player) {

    var action = player.actions[0];
    var cards = move.cards;
    var color = action.color;
    // extract the cards the player has selected
    var selectedCards = [];
    for (var i = 0; i < cards.length; i++) {
      selectedCards.push(player.hand[cards[i]]);
      player.hand[cards[i]].selected = true;
    }

    if (action.color == color && this.validSelection(player, selectedCards, color)) {
      player.actions.push({kind: this.roles[color], description: this.roles[color].toUpperCase()});
      if (this.hasAbilityToUse('CircusMaximus', player)) {
        this.addClientActions(player, color);
        player.doubledClients = true;
      }
      player.pending = selectedCards;
      for (var i = 0; i < player.hand.length; i++) {
        if (player.hand[i].selected) {
          player.hand.splice(i--, 1);
        }
      }
      return this.skip(move, game, player);
    } else {
      return false;
    }
  },

  layFoundation: function(player, game, data, action, move) {
    if (
        6 - game.sites[data.color] < game.players.length
    || (game.sites[data.color] > 0 && ((player.actions[1] && player.actions[1].kind == action.kind) || this.hasAbilityToUse('Tower', player)))) 
    {
      if (
          action
      &&  action.usedRegularArchitect)
      {
        return false;
      }

      // check if player has already layed that building
      var different = true;
      player.buildings.forEach(function(building) {
        if (building.name == data.card.name) {
          different = false;
        }
      }, this);
      if (different == false) {
        return false 
      };
      data.card.selected = false;

      this.addThinkIfPlayerHasAcademy(player, action);

      action.usedRegularArchitect = true;

      // if using an in town site
      if (
         (6 - game.sites[data.color] < game.players.length || this.hasAbilityToUse('Tower', player)))
      {
        data.card.siteColor = data.color;
        player.buildings.push(data.card);
        player.hand.splice(data.index, 1);
        game.sites[data.color]--;
      }

      // else if using an out of town site
      else
      {
        data.card.siteColor = data.color;
        player.buildings.push(data.card);
        player.hand.splice(data.index, 1);
        game.sites[data.color]--;
        player.actions.splice(1,1);
      }

      if (this.allSitesUsed(game.sites, game.players.length)) {
        game.finished = true;
      }
      // check if they have the stairway
      var stairway = this.hasAbilityToUse('Stairway', player);

      return (stairway && !action.usedStairway && action.kind === 'Architect') ? game : this.skip(move, game, player);
    } else {
      return false;
    }
  },

  refill: function(move, game, player) {
    // check latrine

    this.checkLatrine(player, game.pool);

    var name = game.deck.pop();
    player.hand.push({name: name, done: false, materials: [], selected: false, color: this.buildingColors[name]});
    while (player.hand.length < this.handLimit(player) && game.deck.length) {
      name = game.deck.pop();
      player.hand.push({name: name, done: false, materials: [], selected: false, color: this.buildingColors[name]});
    }
    if (!game.deck.length) { game.finished = true };
    return this.skip(move, game, player);
  },

  drawOne: function(move, game, player) {
    this.checkLatrine(player, game.pool);
    
    var name = game.deck.pop();
    player.hand.push({name: name, done: false, materials: [], selected: false, color: this.buildingColors[name]});
    if (game.deck.length < 1) { game.finished = true };
    return this.skip(move, game, player);
  },

  takeJack: function(move, game, player) {
    if (game.pool.black > 0) {
      this.checkLatrine(player, game.pool);
      player.hand.push({name: 'Jack', color: 'black'});
      game.pool.black--;
      return this.skip(move, game, player);
    } else {
      return false;
    }
  },

  patron: function(move, game, player) {
    if (player.clientele.length < this.clienteleLimit(player)) {

      var action = player.actions[0];
      var pool = game.pool;
      var color = move.color;

      if (
          pool[color]
      && !action.takenFromPool) 
      {
        player.clientele.push(this.roles[color]);
        pool[color]--;
        action.takenFromPool = true;
        if (this.hasAbilityToUse('Bath', player)) {
          action.involvesBath = true;
          if (action.takenFromHand && action.takenFromDeck) player.actions.shift();
          player.actions.splice(0, 0, {kind: this.roles[color], description: this.roles[color].toUpperCase()});
          return game;
        }
        return ((!this.hasAbilityToUse('Bar', player) || !!action.takenFromDeck) && (!this.hasAbilityToUse('Aqueduct', player) || !!action.takenFromHand)) ? this.skip(move, game, player) : game;
      }
    }
    return false;
  },

  bar: function(move, game, player) {
    if (player.clientele.length < this.clienteleLimit(player)) {

      var action = player.actions[0];

      if (
          game.deck.length
      && !action.takenFromDeck
      &&  this.hasAbilityToUse('Bar', player))
      {
        var col = this.buildingColors[game.deck.pop()];
        player.clientele.push(this.roles[col]);
        if (game.deck.length === 0) game.finished = true;
        action.takenFromDeck = true;
        if (this.hasAbilityToUse('Bath', player)) {
          action.involvesBath = true;
          if (action.takenFromPool && action.takenFromHand) player.actions.shift();
          player.actions.splice(0, 0, {kind: this.roles[col], description: this.roles[col].toUpperCase()});
          return game;
        }
        return (!!action.takenFromPool && (!this.hasAbilityToUse('Aqueduct', player) || !!action.takenFromHand)) ? this.skip(move, game, player) : game;
      }
    }
    return false;
  },

  aqueduct: function(move, game, player) {
    if (player.clientele.length < this.clienteleLimit(player)) {

      var action = player.actions[0];
      var data = move.data;

      if (
          data.card.name !== 'Jack'
      && !action.takenFromHand
      &&  this.hasAbilityToUse('Aqueduct', player)) 
      {
        player.clientele.push(this.roles[data.card.color]);
        player.hand.splice(data.index, 1);
        action.takenFromHand = true;
        if (this.hasAbilityToUse('Bath', player)) {
          action.involvesBath = true;
          if (action.takenFromPool && action.takenFromDeck) player.actions.shift();
          player.actions.splice(0, 0, {kind: this.roles[data.card.color], description: this.roles[data.card.color].toUpperCase()});
          return game;
        }
        return (!!action.takenFromPool && (!this.hasAbilityToUse('Bar', player) || !!action.takenFromDeck)) ? this.skip(move, game, player) : game;
      }
    }
    return false;
  },

  laborer: function(move, game, player) {
    var action = player.actions[0];
    var color = move.color;
    if (
        game.pool[color]
    && !action.takenFromPool)
    {
      player.stockpile.push(color);
      game.pool[color]--;
      action.takenFromPool = true;
      return (!this.hasAbilityToUse('Dock', player) || !!action.takenFromHand) ? this.skip(move, game, player) : game;
    }
    return false;
  },

  dock: function(move, game, player) {
    var data = move.data;
    var action = player.actions[0];

    if (
        data.card.name !== 'Jack'
    && !action.takenFromHand
    &&  this.hasAbilityToUse('Dock', player)) 
    {
      player.stockpile.push(data.card.color);
      player.hand.splice(data.index, 1);
      action.takenFromHand = true;
      return !!action.takenFromPool ? this.skip(move, game, player) : game;
    }
    return false;
  },

  fillFromHand: function(move, game, player) {
    var structure = player.buildings[move.building];
    var data = move.data;
    var action = player.actions[0];

    if (this.canAddToStructure(structure, player, data.card.color, game, action)) {

      data.card.selected = false;

      structure.materials.push(data.card.color);
      player.hand.splice(data.index, 1);
      this.checkIfComplete(structure, player, game, 'Craftsman');

      this.addThinkIfPlayerHasAcademy(player,{kind:'Craftsman'});

      return this.skip(move, game, player);
    } else {
      return false;
    }
  },

  fillFromStockpile: function(move, game, player) {
    var structure = game.players[move.player].buildings[move.building];
    var data = move.data;
    var action = player.actions[0];

    if (this.canAddToStructure(structure, player, data.material, game, action, move.player)) {
      structure.materials.push(data.material);
      player.stockpile.splice(data.index, 1);

      this.checkIfComplete(structure, player, game, 'Architect');

      if (this.hasAbilityToUse('Stairway', player)) {
        return (!!action.usedRegularArchitect && !!action.usedStairway) ? this.skip(move, game, player) : game;
      } 
      return this.skip(move, game, player);
    } else {
      return false;
    }
  },

  fillFromPool: function(move, game, player) {
    var structure = game.players[move.player].buildings[move.building];
    var color = move.color;
    var action = player.actions[0];

    if (this.canAddToStructure(structure, player, color, game, action, move.player)) {
      structure.materials.push(color);
      game.pool[color]--;

      this.checkIfComplete(structure, player, game, 'Architect');

      if (this.hasAbilityToUse('Stairway', player)) {
        return (!!action.usedRegularArchitect && !!action.usedStairway) ? this.skip(move, game, player) : game;
      } 

      return this.skip(move, game, player);
    } else {
      return false;
    }
  },

  merchant: function(move, game, player) {
    if (player.vault.length < this.vaultLimit(player)) {

      var basilica = this.hasAbilityToUse('Basilica', player);
      var atrium = this.hasAbilityToUse('Atrium', player);
      var action = player.actions[0];
      var data = move.data;

      if (
          data.material
      && !action.takenFromStockpile)
      {
        player.vault.push({visibility: 'public', color: data.material});
        player.stockpile.splice(data.index, 1);
        action.takenFromStockpile = true;
        return (!basilica || !!action.takenFromHand) ? this.skip(move, game, player) : game;
      }
    }
    return false;
  },

  atrium: function(move, game, player) {
    if (player.vault.length < this.vaultLimit(player)) {

      var basilica = this.hasAbilityToUse('Basilica', player);
      var atrium = this.hasAbilityToUse('Atrium', player);
      var action = player.actions[0];

      if (
          atrium
      &&  game.deck.length
      && !action.takenFromStockpile)
      {
        var name = game.deck.pop();
        player.vault.push({visibility: 'none', color: this.buildingColors[name], name: name});
        if (game.deck.length == 0) game.finished = true;
        action.takenFromStockpile = true;
        return (!basilica || !!action.takenFromHand) ? this.skip(move, game, player) : game;
      }
    }
    return false;
  },

  basilica: function(move, game, player) {
    if (player.vault.length < this.vaultLimit(player)) {

      var basilica = this.hasAbilityToUse('Basilica', player);
      var atrium = this.hasAbilityToUse('Atrium', player);
      var action = player.actions[0];

      var data = move.data;

      if (
          data.card.name !== 'Jack'
      && !action.takenFromHand
      &&  basilica)
      {
        player.vault.push({visibility: 'owner', color: data.card.color, name: data.card.name});
        player.hand.splice(data.index, 1);
        action.takenFromHand = true;
        return !!action.takenFromStockpile ? this.skip(move, game, player) : game;
      }
    }
    return false;
  },

  prison: function(move, game, player) {
    var building = move.building;
    var opponent = game.players[move.opponent];
    var index = move.index;
    // check if player has already layed that building
    var different = true;
    player.buildings.forEach(function(b) {
      if (building.name === b.name) {
        different = false;
      }
    }, this);
    if (different == false) { return false };

    if (building.done) {
      player.buildings.push(building);
      if (building.name === 'CircusMaximus' && !player.doubledClients && player.pending.length) this.addClientActions(player, game.currentAction);
      if (!player.influenceModifier) player.influenceModifier = -3;
      else player.influenceModifier -= 3;
      opponent.buildings.splice(index, 1);
      if (!opponent.influenceModifier) opponent.influenceModifier = 3 + (!building.stolen ? this.colorValues[building.siteColor] : 0);
      else opponent.influenceModifier += (3 + (!building.stolen ? this.colorValues[building.siteColor] : 0));
      building.stolen = true;
    } 
    return building.done ? this.skip(move, game, player) : false;
  },

  fountain: function(move, game, player) {
    var action = player.actions[0];
    if (
        this.hasAbilityToUse('Fountain', player)
    && !action.usedFountain) 
    {
      action.usedFountain = true;
      var name = game.deck.pop();
      player.hand.push({
        name: name,
        done: false,
        materials: [],
        selected: true,
        color: this.buildingColors[name]
      });
      if (!game.deck.length) game.finished = true;
      return game;
    }
    return false;
  },

  sewer: function(move, game, player) {
    var data = move.data;
    if (player.pending[data.index].color == 'black') return false;
    var card = player.pending.splice(data.index, 1)[0];
    player.stockpile.push(data.card.color);
    return player.pending.length == 0 ? this.skip(move, game, player) : game;
  },

  // uses action of current player and determines who is to act next
  skip: function(move, game, player) {


    
    // spend action of current player
    var action = player.actions.shift();

    // deal with any bath patrons that are waiting
    var act = player.actions[0];
    while (
        act
    &&  act.involvesBath
    &&  act.takenFromPool
    && (act.takenFromHand || !this.hasAbilityToUse('Aqueduct', player))
    && (act.takenFromDeck || !this.hasAbilityToUse('Bar', player)))
    {
      player.actions.shift();
      act = player.actions[0];
    }
    var newAction = player.actions[0];
    // if the player has no actions left, find next player to act
    if (newAction == undefined) {

      // check if you have used an academy
      if (player.usedAcademy) {
        player.usedAcademy = false;
      }
      // check if the player has a sewer
      if (this.hasAbilityToUse('Sewer', player) && player.pending[0] && !player.usedSewer) {
        player.actions.push({kind:'Sewer', description:'SEWER'});
        player.usedSewer = true
        if (action.kind == 'Legionary') {
          player.madeDemand = false;
          return this.nextToAct(game);
        } else {
          return game;
        }
      }
      if (action && action.kind === 'Rome Demands') {
        // look for next player with rome demands action
        // for each player after the current player
        for (var i = game.currentPlayer + 1; i < game.currentPlayer + game.players.length; i++) {
          // if that player has a rome demands action, it is them to play
          var a = game.players[i % game.players.length].actions[0];
          if (a && a.kind === 'Rome Demands') {
            game.currentPlayer = i % game.players.length;
            return game;
          }
        }
      }
      player.usedSewer = false;
      player.stockpileSelected = -1;
      return this.nextToAct(game);
    }

    // if they just used a rome demands action, and the next action is not a rome demands,
    // play goes to next player with an action
    if (action.kind == 'Rome Demands' && newAction.kind != 'Rome Demands') {
      // look for next player with rome demands action
      // for each player after the current player
      for (var i = game.currentPlayer + 1; i < game.currentPlayer + game.players.length; i++) {
        // if that player has a rome demands action, it is them to play
        var a = game.players[i % game.players.length].actions[0];
        if (a && a.kind === 'Rome Demands') {
          game.currentPlayer = i % game.players.length;
          return game;
        }
      }
      return this.nextToAct(game);
    }

    // if the player just used a legionary action, whether skipping or not, 
    // and has made at least one demand in the current batch of legionary actions,
    // play moves so the other players can respond to the demand
    if (action.kind == 'Legionary' && player.madeDemand && newAction.kind != 'Legionary') {
      player.madeDemand = false;
      return this.nextToAct(game);
    }

    // if they have just led or followed or used the vomitorium, they dont go again
    if (action.kind == 'Lead' || action.kind == 'Follow' || action.kind == 'Jack') {
      return this.nextToAct(game);
    }

    return game;
  },

  unseenCards: function(state) {
    // get the names of the cards which have not been seen by the current player
    // cards in opponents hand that are not public
    // cards in opponents vaults that are not public
    // cards in own vault from atrium
    // cards in deck

    var unseen = [];
    state.players.forEach(function(player) {
      // if opponent
      if (player !== state.players[state.currentPlayer]) {
        player.hand.forEach(function(card) {
          if (!card.shown && card.name !== 'Jack') unseen.push(card.name);
        });
        player.vault.forEach(function(item) {
          if (item.visibility !== 'public') unseen.push(item.name);
        });
      } else {
        player.vault.forEach(function(item) {
          if (item.visibility === 'none') unseen.push(item.name);
        });
      }
    });
    return unseen.concat(state.deck);
  },

  determinise: function(state) {
    // shuffle the unseen cards and place in possible locations
    var unseen = this.shuffle(this.unseenCards(state));

    // cards in opponents hand that are not public
    // cards in opponents vaults that are not public
    // cards in own vault from atrium
    // cards in deck
    state.players.forEach(function(player) {
      // if opponent
      if (player !== state.players[state.currentPlayer]) {
        player.hand.forEach(function(card) {
          if (!card.shown && card.name !== 'Jack') {
            var name = unseen.pop();
            card.name = name;
            card.color = this.buildingColors[name];
          }
        }, this);
        player.vault.forEach(function(item) {
          if (item.visibility !== 'public') {
            var name = unseen.pop();
            item.name = name;
            item.color = this.buildingColors[name];
          }
        }, this);
      } else {
        player.vault.forEach(function(item) {
          if (item.visibility === 'none') {
            var name = unseen.pop();
            item.name = name;
            item.color = this.buildingColors[name];
          }
        }, this);
      }
    }, this);

    state.deck = unseen;

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

