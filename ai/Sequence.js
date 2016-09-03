'use strict'


var Sequence = function(docs) {

	this.docs = {};

	docs.forEach(function(doc) {
		this.docs[doc.first + ' ' + doc.second] = doc.ratio;
	}, this);

}

Sequence.prototype.ratio = function(prev, curr) {

	var doc = prev ? this.docs[prev.kind + ' ' + curr.kind] : undefined;
	return (typeof doc !== 'undefined') ? doc : 0.5;
}

module.exports = Sequence;