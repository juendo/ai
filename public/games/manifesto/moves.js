module.exports = function(move, game, player) {

	var player = game.players[game.currentPlayer];

	switch (move.kind) {
		case 'policy':
			return {
				kind: 'policy',
				card: player.hand[move.card]
			};
		case 'campaign':
			return {
				kind: 'campaign'
			};
		case 'refute':
			return {
				kind: 'refute',
				card: game.players[move.player].discard[move.card]
			}
	}
}