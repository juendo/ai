var Frequency = require('./Frequency');
var Sequence = require('./Sequence');
var User = require('./User');
var Turn = require('./Turn');
var getRandom = require('./getRandom');


var GameData = function(freqDocs, seqDocs, turnDocs, userDocs, playerCount, settings) {
	
	this.freq = new Frequency(freqDocs, playerCount);
	this.seq = new Sequence(seqDocs, playerCount);
	this.turn = new Turn(turnDocs, playerCount);
	this.user = new User(userDocs, playerCount);

	this.settings = settings;
}

GameData.prototype.broader = function() {
	
	return this.settings.broader;
}

GameData.prototype.getIterations = function() {

	return this.settings.n;
}

GameData.prototype.getC = function() {

	return this.settings.c;
}

GameData.prototype.getSimLength = function() {

	return this.settings.amv.simLength;
}

GameData.prototype.usingFPU = function() {

	return this.settings.fpu.freq || this.settings.fpu.seq || this.settings.fpu.turn || this.settings.fpu.user;
}

GameData.prototype.getValue = function(move, prev, user, turn, settings) {

	var value = 1;

	value *= settings.freq ? Math.pow(this.freq.ratio(move), settings.freq) : 1;
	value *= settings.seq ? Math.pow(this.seq.ratio(prev, move), settings.seq) : 1;
	value *= settings.turn ? Math.pow(this.turn.ratio(move, turn), settings.turn) : 1;
	value *= settings.user ? Math.pow(this.user.ratio(move, user), settings.user) : 1;
	// more
	return value;
}

GameData.prototype.bias = function(move, prev, user, turn) {

	return {
		wins: this.settings.bias.db * this.getValue(move, prev, user, turn, this.settings.bias),
		plays: this.settings.bias.db
	};
}

GameData.prototype.amv = function(move, prev, user, turn) {

	return this.getValue(move, prev, user, turn, this.settings.amv);
}

GameData.prototype.sim = function(moves, prev, user, turn) {

	return getRandom(moves, moves.map(function(move) {
		return Math.pow(Math.E, this.getValue(move, prev, user, turn, this.settings.sim) / this.settings.sim.boltzmann);
	}, this));
}

GameData.prototype.fpu = function(move, prev, user, turn) {

	return this.getValue(move, prev, user, turn, this.settings.fpu) * this.settings.fpu.coefficient;
}

module.exports = GameData;