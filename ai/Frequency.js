'use strict'

var logBase = require('./logBase');

var Frequency = function(docs, playerCount) {

	this.docs = {};
	this.playerCount = playerCount;
	this.totalWins = 0;
	this.size = docs.length;

	docs.forEach(function(doc) {

		if (typeof this.docs[JSON.stringify(doc['_id']['move'])] === 'undefined') {

			this.docs[JSON.stringify(doc['_id']['move'])] = {
				total: doc['total'],
				ratio: Math.pow(
					doc['winning'] / doc['total'],
					logBase(playerCount, doc['_id']['players'])
				)
			};
			
		} else {

			var record = this.docs[JSON.stringify(doc['_id']['move'])];

			record.ratio = (record.total * record.ratio + Math.pow(
					doc['winning'] / doc['total'],
					logBase(playerCount, doc['_id']['players'])
				) * doc['total']
			) / (doc['total'] + record.total);

			record.total = doc['total'] + record.total;

		}	
	}, this);

}

Frequency.prototype.ratio = function(move) {

	var doc = this.docs['"' + move.kind + '"'];

	return doc ? doc.ratio : 1 / this.playerCount;
}

module.exports = Frequency;