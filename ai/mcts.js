'use strict'

var Node = require('tree-node');
var deepEqual = require('deep-equal');


// class implementing basic Monte Carlo Tree Search
class MCTS {

	constructor(game) {
		this.game = game;
		this.c = 2;
	}

	getMove(state, n) {

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
			console.log({move: child.data('move'), winRatio: child.data('winRatio')});
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
		//console.log('expand');
		// choose random unchecked move and create new node
		var unchecked = this.uncheckedMoves(node);
		var move = unchecked[Math.floor(Math.random() * unchecked.length)];
		// add new node
		var child = new Node();
		child.data({move: move, state: this.game.applyMove(move, this.game.clone(node.data('state'))), wins: 0, plays: 0});
		node.appendChild(child);

		return child;
	}

	simulate(state) {
		//console.log('simulate');
		while (!this.game.isTerminal(state)) {
			////console.log('applying move');
			// choose random legal move
			var legal = this.game.legalMoves(state);
			var move = legal[Math.floor(Math.random() * legal.length)];
			////console.log(move);
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
			if (this.game.currentPlayer(node._parent.data('state')) === winner)
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

module.exports.getMove = function(game, n) {
	return (new MCTS(game)).getMove(game.getState(), n);
}