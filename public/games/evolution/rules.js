// this file contains code to apply moves

var state = {
  gameName: 'evolution',
  players: [
    {
      hand: [],
      species: [],
      food: 0
    }
  ],
  food: 0,
  deck: [],
  discard: [],
  foodCards: [],
  phase: 'FOOD CARD',
  currentPlayer: 0,
  turn: 0,
  max: 5,
};

var actions = {

  traitFoodCounts: {
    ambush: [-1,-2,-3,0,1,2,3],
    burrowing: [1,2,3,3,4,4,5],
    carnivore: [0,0,1,1,2,2,2,3,3,3,4,4,4,5,5,6,6],
    climbing: [1,2,3,3,4,4,5],
    cooperation: [0,3,3,4,4,5,5],
    defensiveherding: [2,3,4,5,6,7,8],
    fattissue: [-1,0,3,4,4,5,5],
    fertile: [2,3,4,5,6,6,7],
    foraging: [2,3,4,5,6,6,7],
    hardshell: [1,2,3,3,4,4,5],
    horns: [1,2,3,3,4,4,5],
    intelligence: [-1,-2,0,4,5,6,7],
    longneck: [3,4,5,6,7,8,9],
    packhunting: [-1,-2,-3,0,1,2,3],
    scavenger: [2,3,4,5,6,6,7],
    symbiosis: [1,2,3,3,4,4,5],
    warningcall: [1,2,3,3,4,4,5]
  },

  description: function(trait) {
    switch (trait) {
      case 'ambush': return 'Negates Warning Call when attacking.';
      case 'burrowing': return 'This species cannot be attacked if it has food equal to its population.';
      case 'carnivore': return 'Must attack and eat other species. Can never eat Plant Food.';
      case 'climbing': return 'A Carnivore must have Climbing to attack this species.';
      case 'cooperation': return 'When this species takes food, your species to the right takes 1 food from the same source.';
      case 'defensiveherding': return 'A Carnivore must be larger in Population and Body Size to attack this species.';
      case 'fattissue': return 'This species can store food on this card equal to its body size.';
      case 'fertile': return "Before the food cards are revealed, this species gains 1 Population if there is Food on the Watering Hole.";
      case 'foraging': return 'Anytime this species eats Plant Food, take 1 additional Plant Food from the same source.';
      case 'hardshell': return '+4 Body Size when determining if this species can be attacked.';
      case 'horns': return 'A Carnivore must decrease its Population by 1 when attacking this species.';
      case 'intelligence': return "Discard a card from your hand during one of your Feeding turns:\nCarnivore: Negate a trait for this species' next attack.\nNon-Carnivore: Take 2 Food from the Food Bank.";
      case 'longneck': return 'When the food cards are revealed, take 1 Plant Food from the Food Bank.';
      case 'packhunting': return "This species' Body Size is equal to its Population + Body Size when determining if it can attack another species.";
      case 'scavenger': return 'Take 1 Meat Food from the Food Bank when a Carnivore successfuly attacks any species.';
      case 'symbiosis': return 'This species cannot be attacked if your species to the right has a larger Body Size than this species.';
      case 'warningcall': return 'A Carnivore must have Ambush to attack your species that are adjacent to this species.';
      default: return 'm';
    }
  },

  createDeck: function() {
    var deck = [];
    // go through trait food counts and create a card for each
    for (var trait in this.traitFoodCounts) {
      this.traitFoodCounts[trait].forEach(function(food) {
        deck.push({name: trait, food: food});
      });
    }
    return this.shuffle(deck);
  },

  score: function(player) {
    //console.log('score');
    //console.log(player);
    return player.food + (player.species.length ? player.species.map(function(species) {
      return species.population + species.traits.length + species.fat;
    }).reduce(function(prev, curr) {
      return prev + curr;
    }, 0) : 0);
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
    return winner;
  },

  start: function(game) {

    if (game.players.length < 3) return false;
  	game.started = true;

    game.deck = this.createDeck();

    game.players.forEach(function(player) {
      player.species.push({population:1, body: 1, food: 0, fat: 0, traits: []});
      player.hand.push(game.deck.pop());
      player.hand.push(game.deck.pop());
      player.hand.push(game.deck.pop());
      player.hand.push(game.deck.pop());
    });

    game.startPlayer = 0;

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

  draw: function(game) {
    if (game.deck.length) {
      var card = game.deck.pop();
      card.selected = false;
      card.negated = false;
      card.hidden = false;
      return card;
    } 
    else {
      game.deck = this.shuffle(game.discard);
      game.discard = [];
      game.lastTurn = true;
      return this.draw(game);
    }
  },

  takeFood: function(species, player, s, source, game) {
    var traits = {};
    species.traits.forEach(function(trait) {
      trait.hidden = false;
      traits[trait.name] = true;
    });

    if (source === 'longneck') {
      if (traits['carnivore']) return;

      if (species.food < species.population) species.food++;
      else if (traits['fattissue'] && species.fat < species.body) species.fat++;

      if (traits['foraging'] && species.food < species.population) species.food++;
      else if (traits['foraging'] && traits['fattissue'] && species.fat < species.body) species.fat++;

      if (traits['cooperation'] && player.species[s + 1]) this.takeFood(player.species[s + 1], player, s + 1, 'longneck', game);
    } else if (source === 'regular') {
      if (traits['carnivore']) return;
      if (game.food && species.food < species.population) {
        species.food++;
        game.food--;
      } else if (game.food && traits['fattissue'] && species.fat < species.body) {
        species.fat++;
        game.food--;
      }
      if (game.food && traits['foraging'] && species.food < species.population) {
        species.food++;
        game.food--;
      } else if (game.food && traits['foraging'] && traits['fattissue'] && species.fat < species.body) {
        species.fat++;
        game.food--;
      }
      if (game.food && traits['cooperation'] && player.species[s + 1]) {
        this.takeFood(player.species[s + 1], player, s + 1, 'regular', game);
      }

    } else if (source === 'scavenger') {
      if (species.food < species.population) species.food++;
      else if (traits['fattissue'] && species.fat < species.body) species.fat++;
      if (traits['cooperation'] && player.species[s + 1]) this.takeFood(player.species[s + 1], player, s + 1, 'scavenger', game);
    } else if (source === 'attack') {
      if (species.food < species.population) species.food++;
      else if (traits['fattissue'] && species.fat < species.body) species.fat++;
      if (traits['cooperation'] && player.species[s + 1]) this.takeFood(player.species[s + 1], player, s + 1, 'attack', game);

    } else if (source === 'intelligence') {
      var foodGained = 2;
      //console.log('getting 2 food');
      //console.log(foodGained);
      while (species.food < species.population && foodGained) {
        //console.log('eating');
        //console.log(foodGained);
        //console.log(species.food, species.population);
        species.food++;
        foodGained--;
      }
      //console.log(foodGained);
      if (foodGained) {
        //console.log('here');
        while (traits['fattissue'] && species.fat < species.body && foodGained--)
          species.fat++;
      }
      if (traits['foraging'] && species.food < species.population) species.food++;
      else if (traits['foraging'] && traits['fattissue'] && species.fat < species.body) species.fat++;
      // intelligence acts the same as long neck for cooperation
      if (traits['cooperation'] && player.species[s + 1]) this.takeFood(player.species[s + 1], player, s + 1, 'longneck', game);
    }
  
  },

  revealFoodCards: function(game) {
    // reveal hidden traits
    // discard food cards and add appropriate amount of food
    game.players.forEach(function(player) {
      player.species.forEach(function(species, s) {
        var traits = {};
        species.traits.forEach(function(trait) {
          trait.hidden = false;
          traits[trait.name] = true;
        });
        if (game.food && traits['fertile'] && species.population < 6) species.population++;
        if (traits['longneck']) { 
          this.takeFood(species, player, s, 'longneck', game);
        }
        // move fat tissue down
        if (species.fat) {
          while (species.food < species.population && species.fat) {
            species.food++;
            species.fat--;
          }
        }
      }, this);
    }, this);
    game.foodCards.forEach(function(card) {
      game.food += card.food;
      game.discard.unshift(card);
    });
    game.foodCards = [];
    if (game.food < 0) game.food === 0;
  },

  endTurn: function(game) {
    game.players.forEach(function(player) {
      player.passedIntelligence = false;
      var extinct = [];
      player.species.forEach(function(species, s) {
        if (species.food < species.population) {
          species.population = species.food;
        }
        if (!species.population) extinct.push(s);
        player.food += species.food;
        //console.log(1, player.food);
        species.food = 0;
      });
      var offset = 0;
      extinct.forEach(function(s) {
        player.species[s - offset].traits.forEach(function() {
          player.hand.push(this.draw(game));
        }, this);
        player.food += player.species[s - offset].food;
        player.food += player.species[s - offset].fat;
        //console.log(2, player.food);
        player.species.splice(s - offset++, 1);
      }, this);
      player.hand.push(this.draw(game));
      player.hand.push(this.draw(game));
      player.hand.push(this.draw(game));
      player.species.forEach(function() {
        player.hand.push(this.draw(game));
      }, this);
    }, this);
    game.startPlayer = (game.startPlayer + 1) % game.players.length;
    game.currentPlayer = game.startPlayer;
    game.phase = 'FOOD CARD';
    if (game.nextTimeFinished) game.finished = true;
    if (game.lastTurn) game.nextTimeFinished = true;
    return game;
  },

  hasTrait: function(species, trait) {
    for (var i = 0; i < species.traits.length; i++) {
      if (!species.traits[i].negated && species.traits[i].name === trait) return true;
    }
    return false;
  },

  canAttack: function(attacker, defender, defendingPlayer, s) {

    ////console.log('can attack?');
    ////console.log(attacker);
    ////console.log(defender);

    var attackTraits = {};
    for (var i = 0; i < attacker.traits.length; i++) {
      if (!attacker.traits[i].negated) attackTraits[attacker.traits[i].name] = true;
    }

    var defenceTraits = {};
    for (var i = 0; i < defender.traits.length; i++) {
      if (!defender.traits[i].negated) defenceTraits[defender.traits[i].name] = true;
    }
    ////console.log(attackTraits);
    ////console.log(defenceTraits);

    // burrowing
    if (defenceTraits['burrowing'] && defender.food === defender.population) return false;
    ////console.log('not burrowing');

    // climbing
    if (defenceTraits['climbing'] && !attackTraits['climbing']) return false;
    ////console.log('not climbing');

    // defensive herding
    if (defenceTraits['defensiveherding'] && attacker.population <= defender.population) return false;
    ////console.log('not defensiveherding');

    // symbiosis
    if (defenceTraits['symbiosis'] && defendingPlayer.species[s + 1] && defendingPlayer.species[s + 1].body > defender.body) return false;

    ////console.log('not symbiosis');
    // ambush and warning call
    if (((defendingPlayer.species[s - 1] && this.hasTrait(defendingPlayer.species[s - 1], 'warningcall'))
      || (defendingPlayer.species[s + 1] && this.hasTrait(defendingPlayer.species[s + 1], 'warningcall')))
      && !attackTraits['ambush']) return false;
    ////console.log('not warningcall');

    // carnivore and hard shell and pack hunting

    return (attacker.food < attacker.population || (attackTraits['fattissue'] && attacker.fat < attacker.body)) &&
      (attacker.body + (attackTraits['packhunting'] ? attacker.population : 0)) > (defender.body + (defenceTraits['hardshell'] ? 4 : 0));
  },

  hasAttackTarget: function(species, game) {
    for (var i = 0; i < game.players.length; i++) {
      for (var j = 0; j < game.players[i].species.length; j++) {
        var defender = game.players[i].species[j];
        if (species !== defender 
          && this.canAttack(species, defender, game.players[i], j)) {
          return true;
        }
      }
    }
    return false;
  },

  canEat: function(player, game) {
    if (player.passedIntelligence) return false;
    for (var i = 0; i < player.species.length; i++) {
      var species = player.species[i];
      var carnivore = this.hasTrait(species, 'carnivore');
      if (carnivore && (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)) && ((this.hasTrait(species, 'intelligence') && player.hand.length) || this.hasAttackTarget(species, game))) return true;
      if (!carnivore && (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)) && (game.food || (this.hasTrait(species, 'intelligence') && player.hand.length))) return true;
    }
    return false;
  },

  canEatWithoutIntelligence: function(player, game) {
    for (var i = 0; i < player.species.length; i++) {
      var species = player.species[i];
      var carnivore = this.hasTrait(species, 'carnivore');
      if (carnivore && (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)) && this.hasAttackTarget(species, game)) return true;
      if (!carnivore && (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)) && game.food) return true;
    }
    return false;
  },

  ///////////////// MOVES ///////////////////////////////

  trait: function(move, game) {
    var player = game.players[game.currentPlayer];
    var species = player.species[move.species];
    var card = player.hand[move.card];
    if (species.traits.filter(function(trait) {
      return trait.name === card.name;
    }).length) return false;
    player.hand[move.card].hidden = true;
    player.species[move.species].traits.push(player.hand[move.card]);
    player.hand.splice(move.card, 1);

    if (!player.hand.length) return this.done(move, game);
    return game;
  },

  foodCard: function(move, game) {
    // add card to food cards
    var player = game.players[game.currentPlayer];
    game.foodCards.push(player.hand[move.card]);
    player.hand.splice(move.card, 1);
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    if (game.currentPlayer === game.startPlayer) game.phase = 'PLAY CARDS';
    return game;
  },

  population: function(move, game) {
    var player = game.players[game.currentPlayer];
    player.species[move.species].population++;
    game.discard.unshift(player.hand[move.card]);
    player.hand.splice(move.card, 1);

    if (!player.hand.length) return this.done(move, game);
    return game;
  },

  body: function(move, game) {
    var player = game.players[game.currentPlayer];
    player.species[move.species].body++;
    game.discard.unshift(player.hand[move.card]);
    player.hand.splice(move.card, 1);

    if (!player.hand.length) return this.done(move, game);
    return game;
  },

  species: function(move, game) {
    var player = game.players[game.currentPlayer];
    game.discard.unshift(player.hand[move.card]);
    player.hand.splice(move.card, 1);
    var species = {population:1, body: 1, food: 0, fat: 0, traits: []};
    move.direction === 'left' ? player.species.unshift(species) : player.species.push(species);

    if (!player.hand.length) return this.done(move, game);
    return game;
  },

  replace: function(move, game) {
    // cant replace with trait you already have?
    var player = game.players[game.currentPlayer];
    var species = player.species[move.species];
    var card = player.hand[move.card];
    card.hidden = true;
    if (species.traits.filter(function(trait) {
      return trait.name === card.name;
    }).length) return false;
    game.discard.unshift(species.traits[move.trait]);
    if (species.traits[move.trait].name === 'fattissue') {
      player.food += species.fat;
      //console.log(3, player.food);
      species.fat = 0;
    }
    species.traits[move.trait] = card;
    player.hand.splice(move.card, 1);

    if (!player.hand.length) return this.done(move, game);
    return game;
  },

  done: function(move, game) {
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    if (game.currentPlayer === game.startPlayer) {
      game.phase = 'FEED';
      this.revealFoodCards(game);
      return this.checkIfOthersCanEat(game);
    }
    return game;
  },

  feed: function(move, game) {
    var player = game.players[game.currentPlayer];
    var species = player.species[move.species];
    this.takeFood(species, player, move.species, 'regular', game);
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    return this.checkIfOthersCanEat(game);
  },

  attack: function(move, game) {
    var player = game.players[game.currentPlayer];
    var attacker = player.species[move.attacker];
    var defender = game.players[move.player].species[move.defender];
    attacker.attacking = false;
    if (this.hasTrait(defender, 'horns')) {
      attacker.population--;
    }

    var i = defender.body;
    while (attacker.food < attacker.population && i) {
      attacker.food++;
      i--;
    }
    if (this.hasTrait(attacker, 'fattissue') && i) {
      while (attacker.fat < attacker.body && i--) {
        attacker.fat++;
      }
    } 

    defender.population--;
    if (!defender.population) {
      defender.traits.forEach(function() {
        game.players[move.player].hand.push(this.draw(game));
      }, this);
      game.players[move.player].food += defender.food;
      game.players[move.player].food += defender.fat;
      game.players[move.player].species.splice(move.defender, 1);
    }
    if (!attacker.population) {
      attacker.traits.forEach(function() {
        player.hand.push(this.draw(game));
      }, this);
      player.food += attacker.food;
      player.food += attacker.fat;
      //console.log(4, player.food);
      player.species.splice(move.attacker, 1);
    }
    // co-operation
    if (this.hasTrait(attacker, 'cooperation') && player.species[move.attacker + 1])
      this.takeFood(player.species[move.attacker + 1], player, move.attacker + 1, 'attack', game);

    game.players.forEach(function(player) {
      // apply scavengers in reverse order
      var i = player.species.length;
      if (i)
        while (i--)
          if (this.hasTrait(player.species[i], 'scavenger')) this.takeFood(player.species[i], player, i, 'scavenger', game);
    }, this);

    if (game.phase === 'ATTACK') {
      game.phase = 'FEED';
      // un negate traits
      game.players.forEach(function(player) {
        player.species.forEach(function(species) {
          species.traits.forEach(function(trait) { 
            trait.negated = false;
          });
        });
      });
    }
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    return this.checkIfOthersCanEat(game);
  },

  pass: function(move, game) {
    if (game.phase === 'INTELLIGENCE' || game.phase === 'FEED') game.players[game.currentPlayer].passedIntelligence = true;
    game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
    if (game.phase === 'ATTACK') {
      game.phase = 'FEED';
      // un negate traits
      game.players.forEach(function(player) {
        player.species.forEach(function(species) {
          species.traits.forEach(function(trait) { 
            trait.negated = false;
          });
        });
      });
    }
    return game.phase === 'INTELLIGENCE' ? this.checkIntelligence(game) : this.checkIfOthersCanEat(game);
  },

  intelligence: function(move, game) {
    // if not a carnivore
    var player = game.players[game.currentPlayer];
    var species = player.species[move.species];
    game.discard.unshift(player.hand[move.card]);
    player.hand.splice(move.card, 1);
    if (!this.hasTrait(species, 'carnivore')) {
      this.takeFood(species, player, move.species, 'intelligence', game);
      return game.phase === 'INTELLIGENCE' ? this.checkIntelligence(game) : this.checkIfOthersCanEat(game);
    }
    else {
      species.attacking = true;
      game.phase = 'NEGATE TRAIT';
      return game;
    }
  },

  negate: function(move, game) {
    // go though all species and set negate = true for all negated traits
    game.players.forEach(function(player) {
      player.species.forEach(function(species) {
        species.traits.forEach(function(trait) { 
          if (trait.name === move.trait) trait.negated = true;
        });
      });
    });
    game.phase = 'ATTACK';
    return game;
  },

  hasIntelligence: function(player, game) {
    if (!player.hand.length || player.passedIntelligence) return false;
    for (var i = 0; i < player.species.length; i++) {
      var species = player.species[i];
      // if intelligent herbivore with space for food
      if (!this.hasTrait(species, 'carnivore') && this.hasTrait(species, 'intelligence')
        && (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)))
        return true;
    }
    return false;
  },

  checkIntelligence: function(game) {
    var notSmart = 0;
    // check if each player has an intelligent herbivore and cards in hand
    while (!this.hasIntelligence(game.players[game.currentPlayer], game) && notSmart < game.players.length) {
      game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
      notSmart++;
    }
    if (notSmart === game.players.length) {
      game.phase = 'FEED';
      game.players.forEach(function(player) {
        player.passedIntelligence = false;
      });
      return this.checkIfOthersCanEat(game);
    }
    return game;
  },

  checkIfOthersCanEat: function(game) {
    var cantMove = 0;

    while (!this.canEat(game.players[game.currentPlayer], game) && cantMove < game.players.length) {
      game.currentPlayer = (game.currentPlayer + 1) % game.players.length;
      cantMove++;
    }
    if (cantMove === game.players.length)
      return this.endTurn(game);
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