'use strict'


var Turn = function(docs, playerCount) {

	this.docs = {};
	this.playerCount = playerCount;
	this.maxDist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	docs.forEach(function(doc) {
		if (doc.kind === 'maxTurn') {
			this.maxTurn = doc.dist[0];
		} else {

			doc.dist.forEach(function(val, i) {
				if (val > this.maxDist[i]) this.maxDist[i] = val;
			}, this);

			this.docs[doc.kind] = {
				dist: doc.dist,
				total: doc.dist.reduce((a, b) => a + b)
			}
		}
	}, this);

}

Turn.prototype.ratio = function(move, turn) {

	var doc = this.docs[move.kind];

	var interval = Math.floor(10 * turn / (this.maxTurn * this.playerCount)); 

	return doc ? (doc.dist[interval] ? doc.dist[interval] : 1) / (this.maxDist[interval] ? this.maxDist[interval] : 1) : 0;
}

module.exports = Turn;