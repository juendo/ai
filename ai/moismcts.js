'use strict'

var Node = require("tree-node");
var deepEqual = require('deep-equal');
 
class MOISMCTS {

	constructor(game, data) {
		// docs have a move, a number of wins and a number of plays
		// should be split by number of players
		this.game = game;
		this.data = data;
		this.test = data.broader();

		this.translate = require('../public/games/' + game.getState().gameName + '/moves');
	}

	getMove(state, n) {

		// create game tree for each player
		var roots = [];
		for (var i = 0; i < this.game.players(state).length; i++) {
			roots[i] = new Node();
			roots[i].data('player', i);
		}

		var legal = this.game.legalMoves(state);
		if (legal.length === 1) return legal[0];

		while (n--) {
			// choose a determinisation from the root's information set
			var determinisation = this.game.determinise(state);
			roots.forEach(function(root) {
				root.data('determinisation', determinisation);
			}, this);


			// object for tracking player's moves
			var qualities = determinisation.players.map(function(player) {
				return {
					moves: [],
					total: 0, 
					plays: 0
				};
			});

			var nodes = this.select(roots, qualities);
			var winner = this.simulate(this.game.clone(nodes[0].data('determinisation')), qualities);
			this.backpropagate(nodes, winner);
		}

		// return the optimal move
		var root = roots[this.game.currentPlayer(state)];
		return root.childIds.map(function(id) {
			var child = root.getNode(id);
			return child;
		}).reduce(function(prev, current) {
			return prev.data('plays') > current.data('plays') ? prev : current;
		}).data('move');
	}

	select(nodes, qualities) {
		//console.log('select');
		// as we explore the tree, track the moves made by each player
		// track the quality of moves made by each player

		var determinisation = nodes[0].data('determinisation');

		var unchecked = this.uncheckedActions(nodes[this.game.currentPlayer(determinisation)]);

		while (!this.game.isTerminal(determinisation)) {

			var optimal = this.bestChild(nodes[this.game.currentPlayer(determinisation)], unchecked, qualities);

			// expand if optimal node is new
			if (!optimal.checked) {
				return this.expand(nodes, optimal.move, qualities);
			} else {
				optimal = optimal.move;
				var next = this.game.applyMove(optimal, this.game.clone(determinisation));
			
				var currentPlayer = this.game.currentPlayer(determinisation);
				var amv = this.data.amv(
							optimal,
							qualities[currentPlayer].moves[qualities[currentPlayer].moves.length - 1],
							this.game.getName(currentPlayer, determinisation),
							this.game.turn(determinisation)
						);

				qualities[currentPlayer].total += amv;
				qualities[currentPlayer].plays++;
				qualities[currentPlayer].moves.push(optimal);

				nodes = nodes.map(
					this.findOrCreateChild(
						optimal,
						determinisation,
						next
					), this);

				determinisation = next;
				unchecked = this.uncheckedActions(nodes[this.game.currentPlayer(determinisation)]);
			}
		}
		
		return nodes;
	}

	findOrCreateChild(move, prev, next) {

		return function(node) {

			var observed = this.game.translateMove(move, prev, node.data('player'), this.test);
			//console.log(observed);

			var childIDs = node.childIds.filter(function(id) {
				return deepEqual(node.getNode(id).data('action'), observed);
			});

			if (childIDs.length > 1) console.log(observed);

			if (!childIDs.length) {
				if (node.data('player') === this.game.currentPlayer(prev)) {
					console.log('should be expanding');
					console.log(JSON.stringify(observed));
					console.log(childIDs);
				}
				var child = new Node();
				node.appendChild(child);
				child.data({
					player: node.data('player'),
					actingPlayer: this.game.currentPlayer(prev),
					action: observed,
					move: move,
					determinisation: next,
					plays: 0,
					wins: 0,
					availability: 0,
					addedHere: true
				});
			} else {
				var child = node.getNode(childIDs[0]);
			}

			child.data({
				move: move,
				determinisation: next
			});

			return child;
		}
	}

	expand(nodes, move, qualities) {


		var determinisation = nodes[0].data('determinisation');

		if (this.game.isTerminal(determinisation)) return nodes;

		//console.log('depth', this.game.turn(determinisation));

		var currentPlayer = this.game.currentPlayer(determinisation);
		var amv = this.data.amv(
					move,
					qualities[currentPlayer].moves[qualities[currentPlayer].moves.length - 1],
					this.game.getName(currentPlayer, determinisation),
					this.game.turn(determinisation)
				);
		var bias = this.data.bias(
					move,
					qualities[currentPlayer].moves[qualities[currentPlayer].moves.length - 1],
					this.game.getName(currentPlayer, determinisation),
					this.game.turn(determinisation)
				);

		qualities[currentPlayer].total += amv;
		qualities[currentPlayer].plays++;
		qualities[currentPlayer].moves.push(move);

		// get the win ratio for each type of data

		var child = new Node();
		var next = this.game.applyMove(move, this.game.clone(determinisation));


		child.data({
			action: this.game.translateMove(move, determinisation, currentPlayer, this.test),
			player: currentPlayer,
			actingPlayer: currentPlayer,
			determinisation: next,
			move: move,
			wins: bias.wins,
			plays: bias.plays,
			availability: 0
		});

		nodes[currentPlayer].appendChild(child);

		return nodes.map(this.findOrCreateChild(move, determinisation, next), this);
	}

	simulate(state, qualities) {

		var n = this.data.getSimLength();
		while (!this.game.isTerminal(state) && n--) {

			var currentPlayer = this.game.currentPlayer(state);
			var legal = this.game.legalMoves(state);
			var move = this.data.sim(
						legal,
						qualities[currentPlayer].moves[qualities[currentPlayer].moves.length - 1],
						this.game.getName(currentPlayer, state),
						this.game.turn(state)
					);
			var amv = this.data.amv(
						move,
						qualities[currentPlayer].moves[qualities[currentPlayer].moves.length - 1],
						this.game.getName(currentPlayer, state),
						this.game.turn(state)
					);

			qualities[currentPlayer].total += amv;
			qualities[currentPlayer].plays++;
			qualities[currentPlayer].moves.push(move);

			state = this.game.applyMove(move, state);
		}

		return this.game.winner(state, qualities.map(function(q) {
			return q.total / q.plays;
		}));
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
						legal[
							JSON.stringify(
								this.game.translateMove(
									move,
									node._parent.data('determinisation'),
									node._parent.data('player'),
									this.test
								)
							)
						] = move;
					}, this);

					node._parent.childIds.forEach(function(id) {
						var sibling = node._parent.getNode(id);
						if (legal[
								JSON.stringify(sibling.data('action'))
							])
							sibling.data('availability', sibling.data('availability') + 1);
					}, this);
				}
				node = node._parent;
			}
		}, this);
	}


	// return the move of the best child
	bestChild(node, unchecked, qualities) {
		//console.log('best child');

		// check if using FPU
		if (!this.data.usingFPU() && unchecked.length) {
			return {
				move: unchecked[Math.floor(Math.random() * unchecked.length)],
				checked: false
			}
		}

		// get the legal moves for the determinisation
		var legal = {};
		this.game.legalMoves(node.data('determinisation')).forEach(function(move) {
			legal[JSON.stringify(this.game.translateMove(move, node.data('determinisation'), undefined, this.test))] = move;
		}, this);
		// get the compatible child nodes
		var currentPlayer = this.game.currentPlayer(node.data('determinisation'));
		var compatible = node.childIds.filter(function(id) {
			return legal[JSON.stringify(node.getNode(id).data('action'))] && node.getNode(id).data('actingPlayer') === currentPlayer;
		});


		// if there are already compatible child nodes
		if (compatible.length) {


			var logSum = Math.log(compatible.map(function(id) {
				return node.getNode(id).data('availability');
			}).reduce((a, b) => a + b));

			var bestChecked = compatible.map(function(id) {

				var child = node.getNode(id);

				var v = (child.data('wins') / child.data('plays')) + this.data.getC() * Math.sqrt(logSum / child.data('plays'));
				
				
				return {
					node: child,
					v: v
				}
			}, this).reduce(function(prev, current) {
				return (prev.v > current.v) ? prev : current;
			});

			// get the highest value of v for 
			var highestChecked = bestChecked.v;
		} else {
			var bestChecked;
			var highestChecked = -1;
		}

		if (unchecked.length) {
			// get the highest value for unchecked actions
			var bestUnchecked = unchecked.map(function(move) {

				var currentPlayer = this.game.currentPlayer(node.data('determinisation'));

				return {
					move: move,
					v: this.data.fpu(
							this.game.translateMove(move, node.data('determinisation'), undefined, this.test),
							qualities[currentPlayer].moves[qualities[currentPlayer].moves.length - 1],
							this.game.getName(currentPlayer, node.data('determinisation')),
							this.game.turn(node.data('determinisation'))
						)
				}
			}, this).reduce(function(prev, current) {
				return (prev.v > current.v) ? prev : current;
			});
			var highestUnchecked = bestUnchecked.v;
		} else {
			var highestUnchecked = -1;
		}

		if (bestChecked && highestChecked > highestUnchecked) {
			return {
				move: legal[JSON.stringify(bestChecked.node.data('action'))],
				checked: true
			}
		} else {
			
			return {
				move: bestUnchecked.move,
				checked: false
			}
		}

	}

	uncheckedActions(node) {
		//console.log('uncheckedActions');

		// get legal moves for current determinisation
		var legal = this.game.legalMoves(node.data('determinisation'));

		// get the moves for the child nodes
		// only want the child nodes for which the acting player is the current player
		var currentPlayer = this.game.currentPlayer(node.data('determinisation'));
		var checked = node.childIds.map(function(id) {
			return node.getNode(id);
		}).filter(function(child) {
			return child.data('actingPlayer') === currentPlayer;
		}).map(function(child) {
			return child.data('action');
		}, this);

		// find out which legal moves do not already have child nodes
		var unchecked = [];
		for (var i = 0; i < legal.length; i++) {
			var chkd = false;
			var translated = this.game.translateMove(legal[i], node.data('determinisation'), undefined, this.test);
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

module.exports.testMove = function(game, data) {

	return (new MOISMCTS(game, data)).getMove(game.getState(), data.getIterations());
}
