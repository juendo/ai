var inputs = {  
  // called when a card in your hand is clicked
  hand: function(game, meta, data) {

    var player = game.players[game.currentPlayer];
    var action = player.actions[0].kind;
    var data = {index: data, card: player.hand[data]};

    if (action === 'Rome Demands') 
      return {kind: 'romeDemands', data: data};
    else if (action === 'Legionary') 
      return {kind: 'legionary', data: data};
    else if (action === 'Patron') 
      return {kind: 'aqueduct', data: data};
    else if (action === 'Laborer') 
      return {kind: 'dock', data: data};
    else if (action === 'Merchant') 
      return {kind: 'basilica', data: data};

    else if (action === 'Lead' || action === 'Follow')
      data.card.selected = !data.card.selected;
    else if ((action === 'Craftsman' || action === 'Architect') && data.card.name != 'Jack') {
      if (data.card.selected && !player.actions[0].usedFountain) {
        data.card.selected = false;
      } else if (!player.actions[0].usedFountain) {
        player.hand.forEach(function(card) {
          card.selected = false;
        });
        data.card.selected = true;
      }
    }
  },

  // called when the deck is clicked (and you are the current player)
  deck: function(game, meta, data) {

    var player = game.players[game.currentPlayer];
    var action = player.actions[0].kind;

    var cards = [];
    for (var i = 0; i < player.hand.length; i++) {
      if (player.hand[i].selected) {
        cards.push(i);
      }
    }

    if ((action === 'Lead' || action === 'Follow' || action === 'Think') && !actions.hasAbilityToUse('Latrine', player))
      return {kind: player.hand.length < actions.handLimit(player) ? 'refill' : 'drawOne' };
    else if ((action === 'Lead' || action === 'Follow' || action === 'Think') && cards.length <= 1)
      return {kind: player.hand.length < actions.handLimit(player) ? 'refill' : 'drawOne', latrine: cards.length ? cards[0] : undefined};
    else if (action === 'Merchant')
      return {kind: 'atrium'};
    else if (action === 'Patron') 
      return {kind: 'bar'};
    else if (action === 'Craftsman') 
      return {kind: 'fountain'};
  },

  skip: function(game, meta, data) {

    var player = game.players[game.currentPlayer];
    var action = player.actions[0].kind;

    if (action === 'Craftsman') {
      player.hand.forEach(function(card) {
        card.selected = false;
      });
    }
    return {kind: 'skip'};
  },

  jack: function(game, meta, data) {

    var player = game.players[game.currentPlayer];
    var action = player.actions[0].kind;

    var cards = [];
    for (var i = 0; i < player.hand.length; i++) {
      if (player.hand[i].selected) {
        cards.push(i);
      }
    }

    if ((action === 'Lead' || action === 'Follow' || action === 'Think') && !actions.hasAbilityToUse('Latrine', player))
      return {kind: 'takeJack'};
    else if ((action === 'Lead' || action === 'Follow' || action === 'Think') && cards.length <= 1)
      return {kind: 'takeJack', latrine: cards.length ? cards[0] : undefined};
  },

  // called when a drag ends over a structure
  drag: function(game, meta, data) {

    var player = game.players[game.currentPlayer];
    var action = player.actions[0].kind;

    if (data.owner !== game.currentPlayer && !actions.hasAbilityToUse('Stairway', player)) return;

    if (data.data.card && action === 'Craftsman')
      return {kind: 'fillFromHand', building: data.index, data: data.data};
    else if (data.data.material && action === 'Architect')
      return {kind: 'fillFromStockpile', building: data.index, data: data.data, player: data.owner};
    else if (data.data.color && action === 'Architect')
      return {kind: 'fillFromPool', building: data.index, color: data.data.color, player: data.owner};
  },

  // called when a space in the pool is clicked
  pool: function(game, meta, data) {

    var player = game.players[game.currentPlayer];
    var action = player.actions[0].kind;

    var cards = [];
    for (var i = 0; i < player.hand.length; i++) {
      if (player.hand[i].selected) {
        cards.push(i);
      }
    }

    if (action === 'Lead')
      return {kind: 'lead', cards: cards, role: data};
    else if (action === 'Patron')
      return {kind: 'patron', color: data};
    else if (action === 'Laborer')
      return {kind: 'laborer', color: data};
    else if (action === 'Follow')
      return {kind: 'follow', cards: cards};
    else if (cards.length === 1 && (action === 'Craftsman' || action === 'Architect'))
      return {kind: 'lay', index: cards[0], color: data};
  },

  // called when a material in your stockpile is clicked
  stockpile: function(game, meta, data) {

    var player = game.players[game.currentPlayer];
    var action = player.actions[0].kind;

    if (data.owner !== game.currentPlayer) return;

    if (action === 'Merchant')
      return {kind: 'merchant', data: {index: data.index, material: player.stockpile[data.index]}};
    else if (action === 'Architect')
      if (meta.stockpileSelected === data.index)
        meta.stockpileSelected = -1;
      else
        meta.stockpileSelected = data.index;
  },

  pending: function(game, meta, data) {

    var player = game.players[game.currentPlayer];
    var action = player.actions[0].kind;

    if (action === 'Sewer')
      return {kind: 'sewer', data: {index: data.index, card: player.pending[data.index]}};
  },

  building: function(game, meta, data) {

    var player = game.players[game.currentPlayer];
    var action = player.actions[0].kind;

    var cards = [];
    for (var i = 0; i < player.hand.length; i++) {
      if (player.hand[i].selected) {
        cards.push(i);
      }
    }

    if ((action === 'Lead' || action === 'Think' || action === 'Follow')
    && data.building.name === 'Vomitorium' && data.opponent === game.currentPlayer)
      return {kind: 'vomitorium'};
    else if (action === 'Prison' && data.opponent !== game.currentPlayer)
      return {kind: 'prison', building: data.building, opponent: data.opponent, index: data.index};
    else if (cards.length === 1 && action === 'Craftsman' && data.opponent === game.currentPlayer)
      return {kind: 'fillFromHand', building: data.index, data: {index: cards[0], card: player.hand[cards[0]]}};

  }
}