module.exports = function(data) {
	var game = data.game;
	var player = game.players[game.currentPlayer];

	this.hasTrait = function(species, trait) {
		    for (var i = 0; i < species.traits.length; i++) {
		      if (!species.traits[i].negated && species.traits[i].name === trait) return true;
		    }
		    return false;
		  }

	var canAttack = function(attacker, defender, defendingPlayer, s) {

		this.hasTrait = function(species, trait) {
		    for (var i = 0; i < species.traits.length; i++) {
		      if (!species.traits[i].negated && species.traits[i].name === trait) return true;
		    }
		    return false;
		  }

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
	};

	switch (game.phase) {
		case 'FOOD CARD':
			return player.hand.map(function(card, index) {
				return {kind: 'foodCard', card: index};
			});
		case 'PLAY CARDS':
			var moves = [];
			player.hand.forEach(function(card, c) {
				player.species.forEach(function(species, s) {
					if (species.population < 6) moves.push({kind: 'population', species: s, card: c});
					if (species.body < 6) moves.push({kind: 'body', species: s, card: c});
					var alreadyHas = species.traits.filter(function(t) {
						return t.name === card.name;
					}).length;
					if (species.traits.length < 3 && !alreadyHas)
					  moves.push({kind: 'trait', species: s, card: c});
					if (!alreadyHas) species.traits.forEach(function(trait, t) {
						moves.push({kind: 'replace', species: s, trait: t, card: c});
					});
				});
				moves.push({kind: 'species', direction: 'left', card: c});
				moves.push({kind: 'species', direction: 'right', card: c});
			});
			moves.push({kind: 'done'});
			return moves;
		case 'FEED':
			var moves = [];
			player.species.forEach(function(species, s) {
				var carnivore = !!species.traits.filter(function(trait) {
					return trait.name === 'carnivore';
				}).length;
				if (!carnivore && (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)) && game.food) moves.push({kind: 'feed', species: s});
				else if (carnivore && (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body))) {
					for (var i = 0; i < game.players.length; i++) {
				      for (var j = 0; j < game.players[i].species.length; j++) {
				        var defender = game.players[i].species[j];
				        if (species !== defender 
				          && canAttack(species, defender, game.players[i], j)) {
				          moves.push({kind: 'attack', attacker: s, defender: j, player: i});
				        }
				      }
				    }
				}
				if (!this.hasTrait(species, 'carnivore') && this.hasTrait(species, 'intelligence') && (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)))
					player.hand.forEach(function(card, c) {
						moves.push({kind: 'intelligence', species: s, card: c});
					}, this);
				if (this.hasTrait(species, 'carnivore') && this.hasTrait(species, 'intelligence') && (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)))
					player.hand.forEach(function(card, c) {
						moves.push({kind: 'intelligence', species: s, card: c});
					}, this);
			}, this);
			if (!moves.length) moves.push({kind: 'pass'});
			return moves;
		case 'INTELLIGENCE':
			var moves = [];
			player.species.forEach(function(species, s) {
				var carnivore = !!species.traits.filter(function(trait) {
					return trait.name === 'carnivore';
				}).length;
				if (!carnivore && this.hasTrait(species, 'intelligence') && (species.food < species.population || (this.hasTrait(species, 'fattissue') && species.fat < species.body)))
					player.hand.forEach(function(card, c) {
						moves.push({kind: 'intelligence', species: s, card: c});
					}, this);
			}, this);
			return moves;
		case 'NEGATE TRAIT':
			var moves = [];
			var traits = {};
			game.players.forEach(function(player) {
				player.species.forEach(function(species) {
					species.traits.forEach(function(trait) {
						if (trait.name !== 'carnivore' && trait.name !== 'intelligence')
							traits[trait.name] = true;
					});
				});
			});
			for (var t in traits)
				moves.push({kind: 'negate', trait: t});
			return moves;
		case 'ATTACK':
			var moves = [];
			var s = player.species.map(function(species, s) {
		  		return {species: species, index: s};
		  	}).filter(function(item) {
		  		return item.species.attacking;
		  	}).map(function(item) {
		  		return item.index;
		  	})[0];
		  	for (var i = 0; i < game.players.length; i++) {
		      for (var j = 0; j < game.players[i].species.length; j++) {
		        var defender = game.players[i].species[j];
		        if (player.species[s] !== defender 
		          && canAttack(player.species[s], defender, game.players[i], j)) {
		          moves.push({kind: 'attack', attacker: s, defender: j, player: i});
		        }
		      }
		    }
		    player.hand.forEach(function(card, c) {
				moves.push({kind: 'intelligence', species: s, card: c});
			}, this);
		    // can also use second intelligence
		    moves.push({kind: 'pass'});
		    return moves;
	}
}