module.exports.testMove = function(game) {
	var legal = game.legalMoves(game.getState());
	return legal[(Math.floor(Math.random() * legal.length))];
}