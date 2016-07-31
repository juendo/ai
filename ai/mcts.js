'use strict'

var Node = require('tree-node');
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
     
    // end of function
};


// class implementing basic Monte Carlo Tree Search
class MCTS {

	constructor(game, docs) {
		this.game = game;
		this.docs = {};
		docs.forEach(function(doc) {
			this.docs[JSON.stringify(doc['_id'])] = doc['winning'] / doc['total'];
		}, this);
		this.translate = require('../public/games/' + game.getState().gameName + '/moves');
		this.c = 1.4;
		this.db = 25;
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

		var winRatio = this.docs[JSON.stringify(this.translate(move, node.data('state')))];

		child.data({move: move, state: this.game.applyMove(move, this.game.clone(node.data('state'))), wins: (typeof winRatio !== 'undefined') ? this.db * winRatio : 0, plays: (typeof winRatio !== 'undefined') ? this.db : 0});
		node.appendChild(child);

		return child;
	}

	simulate(state) {
		//console.log('simulate');
		while (!this.game.isTerminal(state)) {
			////console.log('applying move');
			// choose random legal move
			var legal = this.game.legalMoves(state);
			//var move = legal[Math.floor(Math.random() * legal.length)];
			var move = getRandomItem(legal, legal.map(function(m) {
				var wr = this.docs[JSON.stringify(this.translate(m, state))];
				return wr ? wr : 0;
			}, this));

			move = move ? move : legal[Math.floor(Math.random() * legal.length)];
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

module.exports.getMove = function(game, n, callback) {

	var freq = require('../db/move_frequency');

	freq(game.getState().gameName, function(docs) {

		callback((new MCTS(game, docs)).getMove(game.getState(), n));
	});
}