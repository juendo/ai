'use strict'

var clone = function(game) {
	return JSON.parse(JSON.stringify(game));
}

class Game {

	constructor(state) {
		this.state = state;
		var rules = require('../public/games/' + state.gameName + '/rules');
    	this.actions = rules.actions;
		this.legal = require('../public/games/' + state.gameName + '/legal');
		this.moves = require('../public/games/' + state.gameName + '/moves');
	}

	isTerminal(state) {
		return state.finished;
	}

	applyMove(move, state) {
		return this.actions.applyMove(move, state);
	}

	winner(state) {
		return this.actions.winner(state);
	}

	currentPlayer(state) {
		return state.currentPlayer;
	}

	legalMoves(state) {
		return this.legal({game: state}, null);
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

	translateMove(move, state) {
		return this.moves(move, state);
	}
}

module.exports = function(state) {
	return new Game(state);
}