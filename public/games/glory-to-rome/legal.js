'use strict'

// AI that plays each action according to basic rules of thumb
// want to get all possible legal moves for a player
class LegalMoves {
  constructor(data, current) {
    // extract the VISIBLE information

    // the current player
    var game = data.game;
    this.game = game;
    this.player = this.game.players[this.game.currentPlayer];
    var rules = require('./rules');
    this.actions = rules.actions;
    this.colors = ['yellow', 'green', 'grey', 'red', 'purple', 'blue'];
  }

  moveset() {

    switch(this.player.actions[0].kind) {
      case 'Lead':
      return this.lead();
      case 'Follow':
      return this.follow();
      case 'Patron':
      return this.patron();
      case 'Merchant':
      return this.merchant();
      case 'Laborer':
      return this.laborer();
      case 'Craftsman':
      return this.craftsman();
      case 'Architect':
      return this.architect();
      case 'Legionary':
      return this.legionary();
      case 'Rome Demands':
      return this.romeDemands();
      case 'Think':
      return this.think();
      case 'Sewer':
      return this.sewer();
      default:
      return [{kind: 'skip'}];
    }
  }

  // return possible moves for leading
  lead() {

    // add in three/two as a jack, and palace
    
    var moves = [];
    var jackConsidered = false;
    for (var i = 0; i < this.player.hand.length; i++) {
      if (this.player.hand[i].color === 'black' && !jackConsidered) {
        jackConsidered = true;
        this.colors.forEach(function(color) {
          moves.push({kind: 'lead', cards: [i], role: color});
        });
      } else if (this.player.hand[i].color !== 'black') {
        moves.push({kind: 'lead', cards: [i], role: this.player.hand[i].color});
      }
    }
    moves.push({kind: 'refill'});
    if (this.game.pool['black'] > 0) {
      moves.push({kind: 'takeJack'});
    }
    return moves;
  }

  follow() {

    // three as a jack
    var moves = [];
    for (var i = 0; i < this.player.hand.length; i++) {
      if (this.player.actions[0].color === this.player.hand[i].color || this.player.hand[i].color === 'black') moves.push({kind: 'follow', cards: [i]});
    }
    moves.push({kind: 'refill'});
    if (this.game.pool['black'] > 0) {
      moves.push({kind: 'takeJack'});
    }
    return moves;
  }

  patron() {

    var moves = [];
    if (this.actions.clienteleLimit(this.player) > this.player.clientele.length) {
      if (!this.player.actions[0].takenFromPool) {
        this.colors.forEach(function(color) {
          if (this.game.pool[color] > 0) {
            moves.push({kind: 'patron', color: color});
          }
        }, this);
      } 
      if (!this.player.actions[0].takenFromDeck && this.actions.hasAbilityToUse('Bar', this.player)) {
        moves.push({kind: 'bar'});
      } 
      if (!this.player.actions[0].takenFromHand && this.actions.hasAbilityToUse('Aqueduct', this.player)) {
        for (var i = 0; i < this.player.hand.length; i++) {
          if (this.player.hand[i].color !== 'black') moves.push({kind: 'aqueduct', data: {card: this.player.hand[i], index: i}});
        }
      }
    }
    moves.push({kind: 'skip'});
    return moves;
  }

  merchant() {
    var moves = [];
    // atrium
    // basilica
    if (this.actions.vaultLimit(this.player) > this.player.vault.length && !this.player.actions[0].takenFromStockpile) {
      var considered = {'yellow': false, 'green': false, 'red': false, 'grey': false, 'blue': false, 'purple': false};
      for (var i = 0; i < this.player.stockpile.length; i++) {
        // not checking vault limit
        if (!considered[this.player.stockpile[i].color]) {
          moves.push({kind: 'merchant', data: {material: this.player.stockpile[i], index: i}});
          considered[this.player.stockpile[i].color] = true;
        }
      }
      if (!this.player.actions[0].takenFromStockpile && this.actions.hasAbilityToUse('Atrium', this.player)) {
        moves.push({kind: 'atrium'});
      }
      if (!this.player.actions[0].takenFromHand && this.actions.hasAbilityToUse('Basilica', this.player)) {
        for (var i = 0; i < this.player.hand.length; i++) {
          if (this.player.hand[i].color !== 'black') moves.push({kind: 'basilica', data: {card: this.player.hand[i], index: i}});
        }
      }
    }
    moves.push({kind: 'skip'});
    return moves;
  }

  laborer() {
    // dock
    var moves = [];
    if (!this.player.actions[0].takenFromPool) {
      this.colors.forEach(function(color) {
        if (this.game.pool[color] > 0) {
          moves.push({kind: 'laborer', color: color});
        }
      }, this);
      if (!this.player.actions[0].takenFromHand && this.actions.hasAbilityToUse('Dock', this.player)) {
        for (var i = 0; i < this.player.hand.length; i++) {
          if (this.player.hand[i].color !== 'black') moves.push({kind: 'dock', data: {card: this.player.hand[i], index: i}});
        }
      }
    }
    moves.push({kind: 'skip'});
    return moves;
  }

  craftsman() {
    var moves = [];
    // first check if can add anything to a structure
    // loop over cards in hand, and for each, loop over buildings
    if (!this.player.actions[0].usedFountain) {
      for (var i = 0; i < this.player.hand.length; i++) {
        for (var j = 0; j < this.player.buildings.length; j++) {
          if (
              this.player.hand[i].color == this.player.buildings[j].siteColor
          && !this.player.buildings[j].done) {
            moves.push({kind: 'fillFromHand', hand: i, building: j, data: {card: this.player.hand[i], index: i}});
          }
        }
      }
      // check if can lay foundation
      for (var i = 0; i < this.player.hand.length; i++) {
        if (this.player.hand[i].color !== 'black') {
          if (this.game.sites[this.player.hand[i].color] > 6 - this.game.players.length) {
            var alreadyHas = false;
            this.player.buildings.forEach(function(b) {
              if (b.name === this.player.hand[i].name) alreadyHas = true;
            }, this);
            if (!alreadyHas) moves.push({kind: 'lay', index: i, color: this.player.hand[i].color});
          }
        }
      }
      // fountain
      if (this.actions.hasAbilityToUse('Fountain', this.player)) {
        moves.push({kind: 'fountain'});
      }
    } else {
      var i = this.player.hand.length - 1;
      for (var j = 0; j < this.player.buildings.length; j++) {
        if (
            this.player.hand[i].color == this.player.buildings[j].siteColor
        && !this.player.buildings[j].done) {
          moves.push({kind: 'fillFromHand', hand: i, building: j, data: {card: this.player.hand[i], index: i}});
        }
      }
      if (this.player.hand[i].color !== 'black') {
        if (this.game.sites[this.player.hand[i].color] > 6 - this.game.players.length) {
          var alreadyHas = false;
          this.player.buildings.forEach(function(b) {
            if (b.name === this.player.hand[i].name) alreadyHas = true;
          }, this);
          if (!alreadyHas) moves.push({kind: 'lay', index: i, color: this.player.hand[i].color});
        }
      }
    }

    moves.push({kind:'skip'});

    return moves;
  }

  architect() {
    // stairway and archway
    var moves = [];
    if (!this.player.actions[0].usedRegularArchitect) {
      // check if can add anything to structures
      for (var i = 0; i < this.player.stockpile.length; i++) {
        for (var j = 0; j < this.player.buildings.length; j++) {
          if (
              this.player.stockpile[i] == this.player.buildings[j].siteColor
          && !this.player.buildings[j].done) {
            moves.push({kind: 'fillFromStockpile', stockpile: i, building: j, data: {material: this.player.stockpile[i], index: i}, player: this.game.currentPlayer});
          }
        }
      }
      // check if can lay foundation
      for (var i = 0; i < this.player.hand.length; i++) {
        if (this.player.hand[i].color !== 'black') {
          if (this.game.sites[this.player.hand[i].color] > 6 - this.game.players.length) {
            var alreadyHas = false;
            this.player.buildings.forEach(function(b) {
              if (b.name === this.player.hand[i].name) alreadyHas = true;
            }, this);
            if (!alreadyHas) moves.push({kind: 'lay', index: i, color: this.player.hand[i].color});
          }
        }
      }
    }
    moves.push({kind:'skip'});

    return moves;
  }

  legionary() {
    var moves = [];
    for (var i = 0; i < this.player.hand.length; i++) {
      if (!this.player.hand[i].selected) {
        if (this.player.hand[i].color != 'black') {
          moves.push({kind: 'legionary', data: {card: this.player.hand[i], index: i}});
        }
      }
    }
    moves.push({kind: 'skip'});
    return moves;
  }

  romeDemands() {
    //palisade and wall
    var moves = [];
    var color = this.player.actions[0].material;
    for (var i = 0; i < this.player.hand.length; i++) {
      if (this.player.hand[i].color == color) {
        moves.push({kind: 'romeDemands', index: i, data: {index: i, card: this.player.hand[i]}});
      }
    }
    if (moves.length === 0) moves.push({kind: 'skip'});

    return moves;
  }

  think() {
    var moves = [];
    if (this.game.pool['black']) moves.push({kind: 'takeJack'});
    moves.push({kind: 'refill'});
    if (this.player.actions[0].skippable) moves.push({kind: 'skip'});
    if (this.actions.hasAbilityToUse('Vomitorium', this.player) && this.player.hand.length) {
      moves.push({kind: 'vomitorium'});
    }
    return moves;
  }

  sewer() {
    var moves = [];
    var considered = {'yellow': false, 'green': false, 'red': false, 'grey': false, 'blue': false, 'purple': false, 'black': true};
    for (var i = 0; i < this.player.pending.length; i++) {
        // not checking vault limit
      if (!considered[this.player.pending[i].color]) {
        moves.push({kind: 'sewer', data: {card: this.player.pending[i], index: i}});
        considered[this.player.pending[i].color] = true;
      }
    }
    moves.push({kind: 'skip'});
    return moves;
  }
}

module.exports = function(game, current) {
  var g = new LegalMoves(game, current);
  return g.moveset();
}