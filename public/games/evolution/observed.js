module.exports = function(move, game, player) {
	if ((typeof player === 'undefined') || player === game.currentPlayer) {
		var player = game.players[game.currentPlayer];
		switch (move.kind) {
			case 'trait':
				return {
					kind: 'trait',
					species: move.species,
					name: player.hand[move.card].name,
					food: player.hand[move.card].food
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
					name: player.hand[move.card].name,
					food: player.hand[move.card].food,
					species: move.species
				}
			case 'body':
				return {
					kind: 'body',
					name: player.hand[move.card].name,
					food: player.hand[move.card].food,
					species: move.species
				}
			case 'species':
				return {
					kind: 'species',
					direction: move.direction,
					name: player.hand[move.card].name,
					food: player.hand[move.card].food
				}
			case 'replace':
				return {
					kind: 'replace',
					species: move.species,
					old: player.species[move.species].traits[move.trait].name,
					name: player.hand[move.card].name,
					food: player.hand[move.card].food
				}
			case 'intelligence':
				return {
					kind: 'intelligence',
					species: move.species,
					name: player.hand[move.card].name,
					food: player.hand[move.card].food
				}
			case 'negate':
				return {
					kind: 'negate',
					trait: move.trait
				}
			case 'done':
				return move;
			case 'pass':
				return move;
			case 'attack':
				return {
					kind: 'attack',
					attacker: move.attacker,
					defender: move.defender,
					player: move.player
				}
			case 'feed':
				return {
					kind: 'feed',
					species: move.species
				}
			default: return move;
		}
	} else {
		var player = game.players[game.currentPlayer];
		switch (move.kind) {
			case 'trait':
				return {
					kind: 'trait',
					species: move.species
				}
			case 'foodCard':
				return {
					kind: 'foodCard'
				}
			case 'population':
				return {
					kind: 'population',
					/*name: player.hand[move.card].name,
					food: player.hand[move.card].food*/
					species: move.species
				}
			case 'body':
				return {
					kind: 'body',
					/*name: player.hand[move.card].name,
					food: player.hand[move.card].food*/
					species: move.species
				}
			case 'species':
				return {
					kind: 'species',
					direction: move.direction,
					/*name: player.hand[move.card].name,
					food: player.hand[move.card].food*/
				}
			case 'replace':
				return {
					kind: 'replace',
					species: move.species,
					old: player.species[move.species].traits[move.trait].name
				}
			case 'intelligence':
				return {
					kind: 'intelligence',
					species: move.species
					/*name: player.hand[move.card].name,
					food: player.hand[move.card].food*/
				}
			case 'negate':
				return {
					kind: 'negate',
					trait: move.trait
				}
			case 'done':
				return move;
			case 'pass':
				return move;
			case 'attack':
				return {
					kind: 'attack',
					attacker: move.attacker,
					defender: move.defender,
					player: move.player
				}
			case 'feed':
				return {
					kind: 'feed',
					species: move.species
				}
			default: return move;
		}
	}
}