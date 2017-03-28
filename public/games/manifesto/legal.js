module.exports = function(data) {
	var game = data.game;
	var player = game.players[game.currentPlayer];

	var moves = [];

	player.hand.forEach(function(card, index) {
		moves.push({kind: 'policy', card: index});
	});

	game.players.forEach(function(p, i) {
		if (p !== player)
			p.discard.forEach(function(card, j) {
				moves.push({kind: 'refute', player: i, card: j});
			});
	});

	if (player.discard.length)
		moves.push({kind: 'campaign'});

	return moves;
}