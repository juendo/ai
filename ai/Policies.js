'use strict'

var rand = function(min, max) {
    return Math.random() * (max - min) + min;
};
 
var getRandomItem = function(list, weight) {
    var total_weight = weight.reduce(function (prev, cur, i, arr) {
        return prev + cur;
    });

    if (!total_weight) return null;
     
    var random_num = rand(0, total_weight);
    var weight_sum = 0;
    ////console.log(random_num)
     
    for (var i = 0; i < list.length; i++) {
        weight_sum += weight[i];
        weight_sum = +weight_sum.toFixed(2);
         
        if (random_num <= weight_sum) {
            return list[i];
        }
    }
};

var Policies = function(pols) {

	this.pols = {};

	pols.forEach(function(pol) {
		this.pols[JSON.stringify(pol['_id'])] = pol['total'];
	}, this);
}

Policies.prototype.plays = function(move, player) {

	var doc = this.pols[JSON.stringify({move: move, player: player})];

	return doc;
}

Policies.prototype.choose = function(moves, translate, state, player) {

	return getRandomItem(moves, moves.map(function(move) {

		var plays = this.plays(translate(move, state), player);
		return plays ? plays : 1 / moves.length;
	}, this));
}

module.exports = Policies;