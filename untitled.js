{
  // what goes in the player box
  // variables here: player
  'player-box': {
    'player-building-area': {
      name: 'player-building-area',
      repeat: 'card in player.cards'
      if: function(game) {
        return !game.finished;
      },
      style: function(player, game) {
        return {};
      },
      children: [
        {
          name: 'img.building'
        }
      ]
    }
  }
}

// structure
{
  'bottom': [
    {

    }
  ],
  'player': {

  },
  'heading': {

  }
}

// component: 

// controller:

{
  'person': {
    if: function() {
      return true;
    },
    style: function() {
      return {};
    },
    click: function() {
      return true;
    }
  } 
}




.player-building-area(ng-repeat='#{component.repeat} track by $index', ng-if='controller[#{component.name}].if(game)')