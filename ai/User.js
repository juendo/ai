'use strict'

var User = function(docs, playerCount) {

	this.docs = {};
    this.playerCount = playerCount;

	docs.forEach(function(doc) {
		var element = {};

        doc.players.moves.forEach(function(entry) {
            element[entry.move] = 1 - Math.pow(2, -(entry.total * doc.overall) / (doc.players.total * entry.overall));
        });

        this.docs[JSON.stringify(doc.players.name)] = element;
	}, this);

}

User.prototype.ratio = function(move, user) {

    var doc = this.docs['"' + user + '"'];
    if (!doc) return 1 / this.playerCount;
    var out = doc[move.kind];
    return out ? out : 0;
}   

module.exports = User;