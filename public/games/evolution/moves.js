module.exports = function(move, game) {
	var player = game.players[game.currentPlayer];
	switch (move.kind) {
		case 'trait':
			return {
				kind: 'trait',
				card: player.hand[move.card].name,
				species: player.species[move.species].traits.map(function(trait) {
					return trait.name;
				})
			}
		case 'foodCard':
			return {
				kind: 'foodCard',
				name: player.hand[move.card].name,
				food: player.hand[move.card].food
			}
		case 'population':
			return {
				kind: 'population',
				card: player.hand[move.card].name,
				species: player.species[move.species].traits.map(function(trait) {
					return trait.name;
				})
			}
		case 'body':
			return {
				kind: 'body',
				card: player.hand[move.card].name,
				species: player.species[move.species].traits.map(function(trait) {
					return trait.name;
				})
			}
		case 'species':
			return {
				kind: 'species',
				direction: move.direction,
				card: player.hand[move.card].name
			}
		case 'replace':
			return {
				kind: 'replace',
				old: player.species[move.species].traits[move.trait].name,
				new: player.hand[move.card].name
			}
		case 'intelligence':
			return {
				kind: 'intelligence',
				species: player.species[move.species].traits.map(function(trait) {
					return trait.name;
				}),
				card: player.hand[move.card].name
			}
		case 'negate':
			return {
				kind: 'negate',
				trait: move.trait
			}
		case 'done':
			return {
				kind: 'done'
			};
		case 'pass':
			return {
				kind: 'pass'
			};
		case 'attack':
			return {
				kind: 'attack',
				attacker: player.species[move.attacker].traits.map(function(trait) {
					return trait.name;
				}),
				defender: game.players[move.player].species[move.defender].traits.map(function(trait){
					return {
						name: trait.name,
						negated: !!trait.negated
					}
				})
			}
		case 'feed':
			return {
				kind: 'feed',
				species: player.species[move.species].traits.map(function(trait) {
					return trait.name;
				})
			}
		default: return move;
	}
}