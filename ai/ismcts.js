'use strict'

var Node = require("tree-node");
var deepEqual = require('deep-equal');

var rand = function(min, max) {
    return Math.random() * (max - min) + min;
};
 
var getRandomItem = function(list, weight) {
    var total_weight = weight.reduce(function (prev, cur, i, arr) {
        return prev + cur;
    });
     
    var random_num = rand(0, total_weight);
    var weight_sum = 0;
    //console.log(random_num)
     
    for (var i = 0; i < list.length; i++) {
        weight_sum += weight[i];
        weight_sum = +weight_sum.toFixed(2);
         
        if (random_num <= weight_sum) {
            return list[i];
        }
    }
};

Math.log = (function() {
  var log = Math.log;
  return function(n, base) {
    return log(n)/(base ? log(base) : 1);
  };
})();
 
class ISMCTS {

	constructor(game, docs, pols) {
		// docs have a move, a number of wins and a number of plays
		// should be split by number of players
		this.game = game;
		this.docs = {};
		this.pols = {};

		// how many players are in current game?
		var playerCount = this.game.getState().players.length;

		docs.forEach(function(doc) {
			// track the win ratio and the total players at each step
			if (typeof this.docs[JSON.stringify(doc['_id']['move'])] === 'undefined') {
				this.docs[JSON.stringify(doc['_id']['move'])] = { total: doc['total'], ratio: Math.pow(doc['winning'] / doc['total'], Math.log(playerCount, doc['_id']['players'])) };
			} else {
				var record = this.docs[JSON.stringify(doc['_id']['move'])];
				record.ratio = (record.total * record.ratio + Math.pow(doc['winning'] / doc['total'], Math.log(playerCount, doc['_id']['players'])) * doc['total']) / (doc['total'] + record.total);
				record.total = doc['total'] + record.total;
			}
			
		}, this);

		pols.forEach(function(pol) {
			this.pols[JSON.stringify(pol['_id'])] = pol['total'];
		}, this);

		this.translate = require('../public/games/' + game.getState().gameName + '/moves');
		this.c = 0.7;
		this.db = 20;
	}

	getMove(state, n) {

		// create game tree
		var root = new Node();
		root.data('infSet', []);

		while (n--) {
			// choose a determinisation from the root's information set
			root.data('determinisation', this.game.determinise(state));

			var node = this.select(root);
			var unchecked = this.uncheckedActions(node);
			if (unchecked.length) {
				node = this.expand(node, unchecked);
			}
			var winner = this.simulate(this.game.clone(node.data('determinisation')));
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

		while (!this.game.isTerminal(node.data('determinisation')) && !this.uncheckedActions(node).length) {
			node = this.bestChild(node);
		}
		return node;
	}

	expand(node, unchecked) {

		var move = unchecked[Math.floor(Math.random() * unchecked.length)];

		var child = new Node();

		var doc = this.docs[JSON.stringify(this.translate(move, node.data('determinisation')))];
		var wins = doc ? doc.ratio * this.db : this.db / node.data('determinisation').players.length;

		child.data({
			infSet: node.data('infSet').concat([this.game.translateMove(move, node.data('determinisation'))]),
			determinisation: this.game.applyMove(move, this.game.clone(node.data('determinisation'))),
			move: move,
			wins: wins,
			plays: this.db,
			availability: 0
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

			var move;
			var name = state.players[state.currentPlayer].name;

			if (name === 'AI') {
				/*move = getRandomItem(legal, legal.map(function(m) {
					var wr = this.docs[JSON.stringify(this.translate(m, state))];
					return wr ? wr.ratio : 1 / state.players.length;
				}, this));*/
				move = getRandomItem(legal, legal.map(function(m) {
					var plays = this.pols[{move: JSON.stringify(this.translate(m, state)), player: 'Hendo'}];
					return plays ? plays : 0;
				}, this));

				move = move ? move : legal[Math.floor(Math.random() * legal.length)];
			} else {
				/*
				move = getRandomItem(legal, legal.map(function(m) {
					var plays = this.pols[{move: JSON.stringify(this.translate(m, state)), player: name}];
					return plays ? plays : 0;
				}, this));*/
				move = getRandomItem(legal, legal.map(function(m) {
					var wr = this.docs[JSON.stringify(this.translate(m, state))];
					return wr ? wr.ratio : 1 / state.players.length;
				}, this));

				move = move ? move : legal[Math.floor(Math.random() * legal.length)];
			}
			
			// apply move
			state = this.game.applyMove(move, state);
			if (!state) console.log(move);
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
			if (winner.indexOf(this.game.currentPlayer(node._parent.data('determinisation'))) >= 0)
				node.data('wins', node.data('wins') + 1);
			
			// get legal moves for parent determinisation
			var legal = {};
			this.game.legalMoves(node._parent.data('determinisation')).forEach(function(move) {
				legal[JSON.stringify(this.game.translateMove(move, node._parent.data('determinisation')))] = move;
			}, this);

			node._parent.childIds.forEach(function(id) {
				var sibling = node._parent.getNode(id);
				var infSet = sibling.data('infSet');
				if (legal[JSON.stringify(infSet[infSet.length - 1])]) sibling.data('availability', sibling.data('availability') + 1);
			}, this);

			node = node._parent;
		}
	}

	bestChild(node) {

		// get the legal moves for the determinisation
		var legal = {};
		this.game.legalMoves(node.data('determinisation')).forEach(function(move) {
			legal[JSON.stringify(this.game.translateMove(move, node.data('determinisation')))] = move;
		}, this);
		// get the compatible child nodes
		var compatible = node.childIds.filter(function(id) {
			var infSet = node.getNode(id).data('infSet');
			return legal[JSON.stringify(infSet[infSet.length - 1])];
		});

		// apply selection algorithm
		var logSum = Math.log(compatible.map(function(id) {
			return node.getNode(id).data('availability');
		}).reduce((a, b) => a + b));

		// return the optimal node
		var optimal = compatible.map(function(id) {

			var child = node.getNode(id);

			return {
				node: child,
				v: (child.data('wins') / child.data('plays')) + this.c * Math.sqrt(logSum / child.data('plays'))
			}
		}, this).reduce(function(prev, current) {
			return (prev.v > current.v) ? prev : current;
		}).node;

		var infSet = optimal.data('infSet');
		optimal.data('determinisation', this.game.applyMove(legal[JSON.stringify(infSet[infSet.length - 1])], this.game.clone(node.data('determinisation'))));

		return optimal;
	}

	uncheckedActions(node) {

		// get legal moves for current determinisation
		var legal = this.game.legalMoves(node.data('determinisation'));

		// get the moves for the child nodes
		var checked = node.childIds.map(function(id) {
			var infSet = node.getNode(id).data('infSet');
			return infSet[infSet.length - 1];
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

module.exports.getMove = function(game, n, callback) {

	var freq = require('../db/move_frequency');
	var user_pol = require('../db/user_policy');

	freq(game.getState().gameName, function(freq) {

		user_pol(game.getState().gameName, game.getState().players.map(function(player) {
			return player.name;
		}), function(pols) {
			callback((new ISMCTS(game, freq, pols)).getMove(game.getState(), n));
		});
	});
}