'use strict'

var Node = require("tree-node");
var deepEqual = require('deep-equal');
var Frequency = require('./Frequency');
var Policies = require('./Policies');

Math.log = (function() {
  var log = Math.log;
  return function(n, base) {
    return log(n)/(base ? log(base) : 1);
  };
})();
 
class MOISMCTS {

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

		// create game tree for each player
		var roots = [];
		for (var i = 0; i < this.game.players(state).length; i++) {
			roots[i] = new Node();
			roots[i].data('player', i);
		}

		while (n--) {
			// choose a determinisation from the root's information set
			var determinisation = this.game.determinise(state);
			roots.forEach(function(root) {
				root.data('determinisation', determinisation);
			}, this);

			var nodes = this.select(roots);

			var unchecked = this.uncheckedActions(
				nodes[this.game.currentPlayer(nodes[0].data('determinisation'))]
			);
			if (unchecked.length) nodes = this.expand(nodes, unchecked);

			var winner = this.simulate(this.game.clone(nodes[0].data('determinisation')));
			this.backpropagate(nodes, winner);
		}

		// return the optimal move
		var root = roots[this.game.currentPlayer(state)];
		return root.childIds.map(function(id) {
			var child = root.getNode(id);
			child.data('winRatio', child.data('wins') / child.data('plays'));
			//console.log({move: child.data('move'), winRatio: child.data('winRatio')});
			return child;
		}).reduce(function(prev, current) {
			return prev.data('winRatio') > current.data('winRatio') ? prev : current;
		}).data('move');
	}

	select(nodes) {
		//console.log('select');

		var determinisation = nodes[0].data('determinisation');

		while (!this.game.isTerminal(determinisation) 
			&& !this.uncheckedActions(nodes[this.game.currentPlayer(determinisation)]).length) {

			var optimal = this.bestChild(nodes[this.game.currentPlayer(determinisation)]);
			var next = this.game.applyMove(optimal, this.game.clone(determinisation));

			nodes = nodes.map(
				this.findOrCreateChild(
					optimal,
					determinisation,
					next
				), this);

			//console.log('currentPlayer')
			//console.log(this.game.currentPlayer(nodes[0].data('determinisation')));
			determinisation = next;

		}
		
		return nodes;
	}

	findOrCreateChild(move, prev, next) {

		return function(node) {

			var observed = this.game.translateMove(move, prev, node.data('player'));
			//console.log(observed);

			var childIDs = node.childIds.filter(function(id) {
				return deepEqual(node.getNode(id).data('action'), observed);
			});

			//console.log(childIDs);

			if (!childIDs.length) {
				var child = new Node();
				node.appendChild(child);
				child.data({
					player: node.data('player'),
					action: observed,
					move: move,
					determinisation: next
				});
			} else {
				var child = node.getNode(childIDs[0]);
			}

			child.data({
				move: move,
				action: observed,
				determinisation: next
			});

			return child;
		}
	}

	expand(nodes, unchecked) {

		var move = unchecked[Math.floor(Math.random() * unchecked.length)];
		var determinisation = nodes[0].data('determinisation');

		var wins = this.frequency.wins(this.translate(move, determinisation));

		var child = new Node();
		var next = this.game.applyMove(move, this.game.clone(determinisation));

		child.data({
			action: this.game.translateMove(move, determinisation, this.game.currentPlayer(determinisation)),
			player: this.game.currentPlayer(determinisation),
			determinisation: next,
			move: move,
			wins: wins,
			plays: this.db,
			availability: 0
		});

		nodes[this.game.currentPlayer(determinisation)].appendChild(child);

		return nodes.map(this.findOrCreateChild(move, determinisation, next), this);
	}

	simulate(state) {
		////console.log('simulate');
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

	backpropagate(nodes, winner) {
		//console.log('backpropagate');

		nodes.forEach(function(node) {
			// go back up the tree
			while (!node.isRoot()) {
				// update plays when node refers to current player
				if (this.game.currentPlayer(node._parent.data('determinisation')) === node._parent.data('player')) {
					node.data('plays', node.data('plays') + 1);
					// update wins
					if (winner.indexOf(this.game.currentPlayer(node._parent.data('determinisation'))) >= 0)
						node.data('wins', node.data('wins') + 1);
					
					// get legal moves for parent determinisation
					var legal = {};
					this.game.legalMoves(node._parent.data('determinisation')).forEach(function(move) {
						legal[JSON.stringify(this.game.translateMove(move, node._parent.data('determinisation')))] = move;
					}, this);

					node._parent.childIds.forEach(function(id) {
						var sibling = node._parent.getNode(id);
						if (legal[JSON.stringify(sibling.data('action'))]) sibling.data('availability', sibling.data('availability') + 1);
					}, this);
				}
				node = node._parent;
			}
		}, this);
	}


	// return the move of the best child
	bestChild(node) {
		//console.log('best child');

		// get the legal moves for the determinisation
		var legal = {};
		this.game.legalMoves(node.data('determinisation')).forEach(function(move) {
			legal[JSON.stringify(this.game.translateMove(move, node.data('determinisation'), node.data('player')))] = move;
		}, this);
		// get the compatible child nodes
		var compatible = node.childIds.filter(function(id) {
			return legal[JSON.stringify(node.getNode(id).data('action'))];
		});

		// apply selection algorithm
		var logSum = Math.log(compatible.map(function(id) {
			return node.getNode(id).data('availability');
		}).reduce((a, b) => a + b));

		// return the optimal node
		return legal[JSON.stringify(compatible.map(function(id) {

			var child = node.getNode(id);

			return {
				node: child,
				v: (child.data('wins') / child.data('plays')) + this.c * Math.sqrt(logSum / child.data('plays'))
			}
		}, this).reduce(function(prev, current) {
			return (prev.v > current.v) ? prev : current;
		}).node.data('action'))];

		//optimal.data('determinisation', this.game.applyMove(legal[JSON.stringify(optimal.data('action'))], this.game.clone(node.data('determinisation'))));
	}

	uncheckedActions(node) {
		//console.log('uncheckedActions');

		// get legal moves for current determinisation
		var legal = this.game.legalMoves(node.data('determinisation'));

		// get the moves for the child nodes
		var checked = node.childIds.map(function(id) {
			return node.getNode(id).data('action');
		});

		// find out which legal moves do not already have child nodes
		var unchecked = [];
		for (var i = 0; i < legal.length; i++) {
			var chkd = false;
			var translated = this.game.translateMove(legal[i], node.data('determinisation'));
			for (var j = 0; j < checked.length; j++) {
				if (deepEqual(translated, checked[j])) {
					chkd = true;
					break;
				}
			}
			if (!chkd) unchecked.push(legal[i]);
		}

		return unchecked;
	}
}

module.exports.testMove = function(game, n, settings, docs) {
	return (new MOISMCTS(game, docs, [], settings)).getMove(game.getState(), n);
}

module.exports.getMove = function(game, n, callback, settings) {

	var freq = require('../db/move_frequency');
	var user_pol = require('../db/user_policy');

	freq(game.getState().gameName, function(freq) {

		user_pol(game.getState().gameName, game.getState().players.map(function(player) {
			return player.name;
		}), function(pols) {
			callback((new MOISMCTS(game, freq, pols, settings)).getMove(game.getState(), n));
		});
	});
}