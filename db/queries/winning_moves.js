module.exports.map = function() {
	var rules = require('../../public/games/glory-to-rome/rules');
	var actions = rules.actions;
	var translateMove = function(move, game) {
		switch (move.kind) {
			case 'Skip':
				return {kind: 'skip', action: game.players[game.currentPlayer].actions[0].kind};
			case 'Sewer':
				return {kind: 'sewer', color: move.data.card.color};
			case 'Fountain':
				return {kind: 'fountain'};
			case 'Prison':
				return {kind: 'prison', name: move.building.name};
			case 'Basilica':
				return {kind: 'basilica', color: move.data.card.color};
			case 'Atrium':
				return {kind: 'atrium'};
			case 'Merchant':
				return {kind: 'merchant', color: move.data.material};
			case 'Fill from Pool':
				var index = (typeof move.player !== 'undefined') ? move.player : game.currentPlayer;
				return {kind: 'fillFromPool', name: game.players[index].buildings[move.building].name, color: move.color, opponent: (index === game.currentPlayer) ? "you" : index};
			case 'Fill from Stockpile':
				var index = (typeof move.player !== 'undefined') ? move.player : game.currentPlayer;
				return {kind: 'fillFromStockpile', name: game.players[index].buildings[move.building].name, color: move.data.material, opponent: (index === game.currentPlayer) ? "you" : index};
			case 'Fill from Hand':
				return {kind: 'fillFromHand', name: game.players[game.currentPlayer].buildings[move.building].name, color: move.data.card.color};
			case 'Dock':
				return {kind: 'dock', name: move.data.card.color};
			case 'Laborer':
				return {kind: 'laborer', color: move.color};
			case 'Aqueduct':
				return {kind: 'aqueduct', name: move.data.card.color};
			case 'Bar':
				return {kind: 'bar'};
			case 'Patron':
				return {kind: 'patron', color: move.color};
			case 'Take Jack':
				return {kind: 'takeJack'};
			case 'Draw One':
				return {kind: 'drawOne'};
			case 'Refill':
				return {kind: actions.handLimit(game.players[game.currentPlayer]) > game.players[game.currentPlayer].hand.length ? 'refill': 'drawOne'};
			case 'Lay':
				return {kind: 'lay', name: game.players[game.currentPlayer].hand[move.index].name, color: move.color};
			case 'Follow':
				return {kind: 'follow', cards: move.cards.map(function(index) {
					return game.players[game.currentPlayer].hand[index].color;
				})};
			case 'Lead':
				return {kind: 'lead', cards: move.cards.map(function(index) {
					return game.players[game.currentPlayer].hand[index].color;
				}), color: move.role};
			case 'Legionary':
				return {kind: 'legionary', color: move.data.card.color};
			case 'Rome Demands':
				return {kind: 'romeDemands', name: move.data.card.name};
			case 'Vomitorium':
				return {kind: 'vomitorium'};
			default:
				return {};
		}
	}
	if (this.winner && this.move && this.game) {
		var move = translateMove(this.move, this.game);
		emit({winning: this.winner === this.name, move: move, user: this.game.players[this.game.currentPlayer].name, players: this.game.players.length, turn: this.game.turn}, 1);
	}
}

module.exports.reduce = function(key, count) {
  return Array.sum(count);
}