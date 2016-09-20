var inputs = {

  selected: function(player) {
  	return player.hand.map(function(card, index) {
  		return {card: card, index: index};
  	}).filter(function(element) {
  		return element.card.selected;
  	}).map(function(element) {
  		return element.index;
  	});
  },
  	
  canAttack: function(attacker, defender, defendingPlayer, s) {

  	this.hasTrait = function(species, trait) {
    for (var i = 0; i < species.traits.length; i++) {
      if (!species.traits[i].negated && species.traits[i].name === trait) return true;
    }
    return false;
  };

    //console.log('can attack?');
    //console.log(attacker);
    //console.log(defender);

    var attackTraits = {};
    for (var i = 0; i < attacker.traits.length; i++) {
      if (!attacker.traits[i].negated) attackTraits[attacker.traits[i].name] = true;
    }

    var defenceTraits = {};
    for (var i = 0; i < defender.traits.length; i++) {
      if (!defender.traits[i].negated) defenceTraits[defender.traits[i].name] = true;
    }
    //console.log(attackTraits);
    //console.log(defenceTraits);

    // burrowing
    if (defenceTraits['burrowing'] && defender.food === defender.population) return false;
    //console.log('not burrowing');

    // climbing
    if (defenceTraits['climbing'] && !attackTraits['climbing']) return false;
    //console.log('not climbing');

    // defensive herding
    if (defenceTraits['defensiveherding'] && attacker.population <= defender.population) return false;
    //console.log('not defensiveherding');

    // symbiosis
    if (defenceTraits['symbiosis'] && defendingPlayer.species[s + 1] && defendingPlayer.species[s + 1].body > defender.body) return false;

    //console.log('not symbiosis');
    // ambush and warning call
    if (((defendingPlayer.species[s - 1] && this.hasTrait(defendingPlayer.species[s - 1], 'warningcall'))
      || (defendingPlayer.species[s + 1] && this.hasTrait(defendingPlayer.species[s + 1], 'warningcall')))
      && !attackTraits['ambush']) return false;
    //console.log('not warningcall');

    // carnivore and hard shell and pack hunting

    return (attacker.food < attacker.population || (attackTraits['fattissue'] && attacker.fat < attacker.body)) &&
      (attacker.body + (attackTraits['packhunting'] ? attacker.population : 0)) > (defender.body + (defenceTraits['hardshell'] ? 4 : 0));
  },

  hand: function(game, meta, data) {
  	var player = game.players[game.currentPlayer];
    player.hand[data].selected = !player.hand[data].selected;
  },

  species: function(game, meta, data) {
  	var player = game.players[game.currentPlayer];
  	var species = game.players[data.player].species[data.species];
  	var selected = this.selected(player);

  	if (game.phase === 'PLAY CARDS'
  		&& player === game.players[data.player]
  		&& selected.length === 1
  		&& species.traits.length < 3)
  	  return {kind: 'trait', card: selected[0], species: data.species};
  },

  wateringHole: function(game, meta, data) {
  	var player = game.players[game.currentPlayer];
  	var selected = this.selected(player);
    if (game.phase === 'FOOD CARD' 
    	&& selected.length === 1)
      return {kind: 'foodCard', card: selected[0]};
  },

  population: function(game, meta, data) {
  	var player = game.players[game.currentPlayer];
  	var selected = this.selected(player);
  	if (player === game.players[data.player] 
  		&& game.phase === 'PLAY CARDS'
  		&& selected.length === 1
  		&& player.species[data.species].population < 6)
  	  return {kind: 'population', species: data.species, card: selected[0]};
  },

  body: function(game, meta, data) {
  	var player = game.players[game.currentPlayer];
  	var selected = this.selected(player);
  	if (player === game.players[data.player] 
  		&& game.phase === 'PLAY CARDS'
  		&& selected.length === 1
  		&& player.species[data.species].body < 6)
  	  return {kind: 'body', species: data.species, card: selected[0]};
  },

  newSpecies: function(game, meta, data) {
  	var player = game.players[game.currentPlayer];
  	var selected = this.selected(player);
  	if (player === game.players[data.player]
  		&& game.phase === 'PLAY CARDS'
  		&& selected.length === 1)
  	  return {kind: 'species', direction: data.direction, card: selected[0]};
  },

  trait: function(game, meta, data) {

  	this.hasTrait = function(species, trait) {
	    for (var i = 0; i < species.traits.length; i++) {
	      if (!species.traits[i].negated && species.traits[i].name === trait) return true;
	    }
	    return false;
	  }

  	var player = game.players[game.currentPlayer];
  	var selected = this.selected(player);
  	var species = player.species[data.species];
  	var attacking = player.species.map(function(species, s) {
  	  	return {species: species, index: s};
  	  }).filter(function(item) {
  	  	return item.species.attacking;
  	  }).map(function(item) {
  	  	return item.index;
  	  });

  	 var trait = game.players[data.player].species[data.species].traits[data.trait].name;

  	if (player === game.players[data.player]
  		&& game.phase === 'PLAY CARDS'
  		&& selected.length === 1)
  	  return {kind: 'replace', species: data.species, trait: data.trait, card: selected[0]};
  	else if (player === game.players[data.player]
  		&& (game.phase === 'FEED' || game.phase === 'ATTACK')
  		&& selected.length === 1
  		&& species.traits[data.trait].name === 'intelligence'
  		&& (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)))
  	  return {kind: 'intelligence', species: data.species, card: selected[0]};
  	else if (game.phase === 'NEGATE TRAIT' && trait !== 'carnivore' && trait !== 'intelligence')
  	  return {kind: 'negate', trait: trait};
  },

  done: function(game, meta, data) {
  	// only pass if no species hungry and can eat
  	return game.phase === 'PLAY CARDS' ? {kind: 'done'} : {kind: 'pass'};
  },

  feed: function(game, meta, data) {

  	this.hasTrait = function(species, trait) {
    for (var i = 0; i < species.traits.length; i++) {
      if (!species.traits[i].negated && species.traits[i].name === trait) return true;
    }
    return false;
  }

  	var player = game.players[game.currentPlayer];
  	var species = game.players[data.player].species[data.species];
  	var carnivore = !!species.traits.filter(function(trait) {
  		return trait.name === 'carnivore';
  	}).length;
    var attacking = player.species.map(function(species, s) {
        return {species: species, index: s};
      }).filter(function(item) {
        return item.species.attacking;
      }).map(function(item) {
        return item.index;
      });
  	if (!carnivore
  		&& player === game.players[data.player] 
  		&& (game.phase === 'FEED' || game.phase === 'ATTACK')
  		&& (game.food || attacking.length)
  		&& (attacking.length || (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)))) {

  	  if (attacking.length === 1 && this.canAttack(player.species[attacking[0]], player.species[data.species], player, data.species))
  	  	return {kind: 'attack', attacker: attacking[0], defender: data.species, player: data.player};
  	  else if (attacking.length !== 1 && game.phase === 'FEED')
  		return {kind: 'feed', species: data.species};
  	}
  	else if (
  		carnivore
  		&& player === game.players[data.player] 
  		&& game.phase === 'FEED'
  		&& (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body))) {
  		var attacking = player.species.map(function(species, s) {
  	  	return {species: species, index: s};
  	  }).filter(function(item) {
  	  	return item.species.attacking;
  	  }).map(function(item) {
  	  	return item.index;
  	  });
      // attack 
  	  if (attacking.length && player.species[attacking[0]] !== species && this.canAttack(player.species[attacking[0]], species, player, data.species)) {
  	  	return {kind: 'attack', attacker: attacking[0], defender: data.species, player: data.player};
  	  } else if (!attacking.length || player.species[attacking[0]] === species) {
        // otherwise toggle attacking
        species.attacking = !species.attacking;
      }
  	}
  	else if (player !== game.players[data.player]
  		&& (game.phase === 'FEED' || game.phase === 'ATTACK')) {
  	  var attacking = player.species.map(function(species, s) {
  	  	return {species: species, index: s};
  	  }).filter(function(item) {
  	  	return item.species.attacking;
  	  }).map(function(item) {
  	  	return item.index;
  	  });
  	  if (attacking.length === 1) {
  	  	var attacker = player.species[attacking[0]];
  	  	if (this.canAttack(attacker, species, game.players[data.player], data.species)) {
  	  		return {kind: 'attack', attacker: attacking[0], defender: data.species, player: data.player};
  	  	}
  	  }
  	}
  },
};