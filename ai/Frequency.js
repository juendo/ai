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

var Frequency = function(docs, c, playerCount) {

	this.docs = {};
	this.c = c;
	this.playerCount = playerCount;

	docs.forEach(function(doc) {
		// track the win ratio and the total players at each step
		if (typeof this.docs[JSON.stringify(doc['_id']['move'])] === 'undefined') {
			this.docs[JSON.stringify(doc['_id']['move'])] = {
				total: doc['total'],
				ratio: Math.pow(
					doc['winning'] / doc['total'],
					Math.log(playerCount, doc['_id']['players'])
				)
			};
		} else {
			var record = this.docs[JSON.stringify(doc['_id']['move'])];
			record.ratio = (record.total * record.ratio + Math.pow(
					doc['winning'] / doc['total'],
					Math.log(
						playerCount,
						doc['_id']['players']
					)
				) * doc['total']
			) / (doc['total'] + record.total);
			record.total = doc['total'] + record.total;
		}	
	}, this);
}

Frequency.prototype.wins = function(move) {

	var doc = this.docs[JSON.stringify(move)];

	return doc ? doc.ratio * this.c : this.c / this.playerCount;
}

Frequency.prototype.choose = function(moves, translate, state) {

	return getRandomItem(moves, moves.map(function(move) {
		return this.wins(translate(move, state));
	}, this));
}

module.exports = Frequency;