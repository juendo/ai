$( document ).ready(function() {

	$( '#join-game' ).click(function() {
		$( '.game-button' ).toggle(false);
		$( '#join-game-form' ).toggle(true);
	});

	$( '.back' ).click(function() {
		$( '#new-game-form' ).toggle(false);
		$( '#join-game-form' ).toggle(false);
		$( '.game-button' ).toggle(true);
	});

});