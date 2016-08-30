'use strict'

var Node = require('tree-node');
var deepEqual = require('deep-equal');
var Frequency = require('./Frequency');
var Policies = require('./Policies');

Math.log = (function() {
  var log = Math.log;
  return function(n, base) {
    return log(n)/(base ? log(base) : 1);
  };
})();



// class implementing basic Monte Carlo Tree Search
class MCTS {

	constructor(game, docs, pols, settings) {
		// docs have a move, a number of wins and a number of plays
		// should be split by number of players
		this.game = game;
		this.db = settings.db;
		this.c = settings.c;

		this.frequency = new Frequency(docs, this.db, this.game.getState().players.length);
		this.policies = new Policies(pols);
		this.translate = require('../public/games/' + game.getState().gameName + '/moves');
	}

	getMove(state, n) {

		var legal = this.game.legalMoves(state);
		if (legal.length === 1) return legal[0];

		// create game tree
		var root = new Node();
		root.data({state: this.game.clone(state), wins: 0, plays: 0});

		while (n--) {

			//console.log(n);
			// add new node to the tree
			var node = this.select(root)

			// if the node is non-terminal
			if (!this.game.isTerminal(node.data('state'))) {
				node = this.expand(node);
				// find the winner
				var winner = this.simulate(this.game.clone(node.data('state')));
			} else {
				var winner = this.game.winner(node.data('state'));
			}

			this.backpropagate(node, winner);

		}

		// return the optimal move
		return root.childIds.map(function(id) {
			var child = root.getNode(id);
			child.data('winRatio', child.data('wins') / child.data('plays'));
			//console.log({move: child.data('move'), winRatio: child.data('winRatio')});
			return child;
		}).reduce(function(prev, current) {
			return prev.data('winRatio') > current.data('winRatio') ? prev : current;
		}).data('move');

	}

	select(node) {
		//console.log('select');
		// while the tree has been searched fully, select an action using the UCT algorithm
		while (!this.game.isTerminal(node.data('state')) && this.uncheckedMoves(node).length === 0) {
			node = this.uct(node);
			//console.log('traverse');
		}
		
		return node;
	}

	expand(node) {
		// choose random unchecked move and create new node
		var unchecked = this.uncheckedMoves(node);
		var move = unchecked[Math.floor(Math.random() * unchecked.length)];

		// add new node
		var child = new Node();

		var wins = this.frequency.wins(this.translate[move.kind](move, node.data('state')));

		child.data({
			move: move,
			state: this.game.applyMove(move, this.game.clone(node.data('state'))),
			wins: wins,
			plays: this.db
		});
		node.appendChild(child);

		return child;
	}

	simulate(state) {
		//console.log('simulate');
		while (!this.game.isTerminal(state)) {
			// choose random legal move
			var legal = this.game.legalMoves(state);
			//var move = legal[Math.floor(Math.random() * legal.length)];

			var name = state.players[state.currentPlayer].name;

			if (name === 'AI') {

				var move = this.frequency.choose(legal, this.translate, state);

			} else {
				var move = this.policies.choose(legal, this.translate, state, name);
			}
						
			// apply move
			state = this.game.applyMove(move, state);
		}

		return this.game.winner(state);
	}

	backpropagate(node, winner) {

		//console.log('backpropagate');

		// go back up the tree
		while (!node.isRoot()) {
			// update plays
			node.data('plays', node.data('plays') + 1);
			// update wins
			if (winner.indexOf(this.game.currentPlayer(node._parent.data('state'))) >= 0)
				node.data('wins', node.data('wins') + 1);
			
			node = node._parent;
		}
	}

	uncheckedMoves(node) {

		// get legal moves and checked moves
		var legal = this.game.legalMoves(node.data('state'));

		var checked = node.childIds.map(function(id) {
			return node.getNode(id).data('move');
		});

		var unchecked = [];
		for (var i = 0; i < legal.length; i++) {
			var chkd = false;
			for (var j = 0; j < checked.length; j++) {
				if (deepEqual(legal[i], checked[j])) {
					chkd = true;
					break;
				}
			}
			if (!chkd) unchecked.push(legal[i]);
		}

		// return their difference
		return unchecked;
	}

	uct(node) {

		// calculate sum of plays of child nodes
		var logSum = Math.log(node.childIds.map(function(id) {
			return node.getNode(id).data('plays');
		}).reduce((a, b) => a + b));

		// return the optimal node
		return node.childIds.map(function(id) {

			var child = node.getNode(id);

			return {
				node: child,
				v: (child.data('wins') / child.data('plays')) + this.c * Math.sqrt(logSum / child.data('plays'))
			}
		}, this).reduce(function(prev, current) {
			return (prev.v > current.v) ? prev : current;
		}).node;
	}
}

module.exports.testMove = function(game, n, settings) {
	return (new MCTS(game, [], [], settings)).getMove(game.getState(), n);
}

module.exports.getMove = function(game, n, callback) {

	var freq = require('../db/move_frequency');
	var user_pol = require('../db/user_policy');

	freq(game.getState().gameName, function(freq) {

		user_pol(game.getState().gameName, game.getState().players.map(function(player) {
			return player.name;
		}), function(pols) {
			callback((new MCTS(game, freq, pols)).getMove(game.getState(), n));
		});
	});
}