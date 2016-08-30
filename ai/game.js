'use strict'

var clone = function(game) {
	return JSON.parse(JSON.stringify(game));
}

class Game {

	constructor(state, noSkip) {
		this.state = state;
		var rules = require('../public/games/' + state.gameName + '/rules');
    	this.actions = rules.actions;
		this.legal = require('../public/games/' + state.gameName + '/legal');
		this.observed = require('../public/games/' + state.gameName + '/observed');
		this.noSkip = noSkip;
	}

	isTerminal(state) {
		return state.finished;
	}

	applyMove(move, state) {
		return this.actions.applyMove(move, state);
	}

	winner(state, qualities) {
		if (state.finished) return this.actions.winner(state);
		var winningIndex = -1;
		var maxQ = -1;
		for (var i = 0; i < qualities.length; i++) {
			if (qualities[i] > maxQ) {
				winningIndex = i;
				maxQ = qualities[i];
			}
		}
		return [winningIndex];
	}

	currentPlayer(state) {
		return state.currentPlayer;
	}

	legalMoves(state) {
		return this.legal({game: state}, null, this.noSkip);
	}

	getState() {
		return this.state;
	}

	clone(state) {
		return clone(state);
	}

	determinise(state) {
		return this.actions.determinise(clone(state));
	}

	translateMove(move, state, player, test) {
		return this.observed(move, state, player, test);
	}

	players(state) {
		return state.players;
	}

	turn(state) {
		return state.turn;
	}

	getName(index, state) {
		return state.players[index].name;
	}
}

module.exports = function(state) {
	return new Game(state);
}