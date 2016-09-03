'use strict'

var Combinatorics = require('js-combinatorics');

// AI that plays each action according to basic rules of thumb
// want to get all possible legal moves for a player
class LegalMoves {
  constructor(data, current, noSkip) {
    // extract the VISIBLE information

    // the current player
    var game = data.game;
    this.game = game;
    this.player = this.game.players[this.game.currentPlayer];
    var rules = require('./rules');
    this.actions = rules.actions;
    this.colors = ['yellow', 'green', 'grey', 'red', 'purple', 'blue'];
    this.testNoSkip = noSkip;
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
      case 'Prison':
      return this.prison();
      default:
      return [{kind: 'skip'}];
    }
  }

  // return possible moves for leading
  lead() {

    // add in three/two as a jack, and palace
    
    var moves = [];
    var jackConsidered = false;
    var colourCounts = {'yellow': [], 'green': [], 'red': [], 'grey': [], 'blue': [], 'purple': [], 'black': []};
    for (var i = 0; i < this.player.hand.length; i++) {
      //console.log(this.player.hand[i]);
      colourCounts[this.player.hand[i].color].push(i);
      if (this.player.hand[i].color === 'black' && !jackConsidered) {
        jackConsidered = true;
        this.colors.forEach(function(color) {
          moves.push({kind: 'lead', cards: [i], role: color});
        });
      } else if (this.player.hand[i].color !== 'black') {
        moves.push({kind: 'lead', cards: [i], role: this.player.hand[i].color});
      }
    }

    // add the 3/2 as a jacks
    var jackNum = this.actions.hasAbilityToUse('Circus', this.player) ? 2 : 3;
    this.colors.forEach(function(color) {
      if (colourCounts[color].length >= jackNum) {
        var cmb = Combinatorics.combination(colourCounts[color], jackNum);
        var cards = cmb.next();
        this.colors.forEach(function(role) {
          moves.push({kind: 'lead', cards: cards, role: role});
        }, this);
      }
    }, this);

    if (this.actions.hasAbilityToUse('Palace', this.player)) {
      this.colors.forEach(function(role) {
        if (colourCounts[role].length + colourCounts['black'].length) moves.push({kind: 'lead', cards: colourCounts[role].concat(colourCounts['black']), role: role});
      }, this);
    }

    moves.push({kind: this.player.hand.length < this.actions.handLimit(this.player) ? 'refill' : 'drawOne' });
    if (this.game.pool['black'] > 0) {
      moves.push({kind: 'takeJack'});
    }
    return moves;
  }

  follow() {

    // three as a jack
    var moves = [];
    var colourCounts = {'yellow': [], 'green': [], 'red': [], 'grey': [], 'blue': [], 'purple': [], 'black': []};
    for (var i = 0; i < this.player.hand.length; i++) {
      //console.log(this.player.hand[i]);
      colourCounts[this.player.hand[i].color].push(i);
      if (this.player.actions[0].color === this.player.hand[i].color || this.player.hand[i].color === 'black') moves.push({kind: 'follow', cards: [i]});
    }
    // add the 3/2 as a jacks
    var jackNum = this.actions.hasAbilityToUse('Circus', this.player) ? 2 : 3;
    this.colors.forEach(function(color) {
      if (colourCounts[color].length >= jackNum) {
        var cmb = Combinatorics.combination(colourCounts[color], jackNum);
        moves.push({kind: 'follow', cards: cmb.next()});
      }
    }, this);

    if (this.actions.hasAbilityToUse('Palace', this.player)) {
      if (colourCounts[this.player.actions[0].color].length + colourCounts['black'].length) moves.push({kind: 'follow', cards: colourCounts[this.player.actions[0].color].concat(colourCounts['black'])});
    }

    moves.push({kind: this.player.hand.length < this.actions.handLimit(this.player) ? 'refill' : 'drawOne' });
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
    if (!moves.length || !this.testNoSkip) moves.push({kind: 'skip'});
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
      if (this.actions.hasAbilityToUse('Atrium', this.player)) {
        moves.push({kind: 'atrium'});
      }
    }
    if (this.actions.vaultLimit(this.player) > this.player.vault.length && !this.player.actions[0].takenFromHand && this.actions.hasAbilityToUse('Basilica', this.player)) {
      for (var i = 0; i < this.player.hand.length; i++) {
        if (this.player.hand[i].color !== 'black') moves.push({kind: 'basilica', data: {card: this.player.hand[i], index: i}});
      }
    }
    if (!moves.length || !this.testNoSkip) moves.push({kind: 'skip'});
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
    }
    if (!this.player.actions[0].takenFromHand && this.actions.hasAbilityToUse('Dock', this.player)) {
      for (var i = 0; i < this.player.hand.length; i++) {
        if (this.player.hand[i].color !== 'black') moves.push({kind: 'dock', data: {card: this.player.hand[i], index: i}});
      }
    }
    if (!moves.length || !this.testNoSkip) moves.push({kind: 'skip'});
    return moves;
  }

  craftsman() {
    var moves = [];
    // first check if can add anything to a structure
    // loop over cards in hand, and for each, loop over buildings
    if (!this.player.actions[0].usedFountain) {
      for (var i = 0; i < this.player.hand.length; i++) {
        for (var j = 0; j < this.player.buildings.length; j++) {
          if (this.canAddToStructure(this.player.hand[i].color, this.player.buildings[j], this.game.currentPlayer, this.game.currentPlayer)) {
            moves.push({kind: 'fillFromHand', hand: i, building: j, data: {card: this.player.hand[i], index: i}});
          }
        }
      }
      // check if can lay foundation
      for (var i = 0; i < this.player.hand.length; i++) {
        if (this.player.hand[i].color !== 'black') {
          if (this.player.hand[i].name !== 'Statue' && this.game.sites[this.player.hand[i].color] > 6 - this.game.players.length || (this.game.sites[this.player.hand[i].color] > 0 && ((this.player.actions[1] && this.player.actions[1].kind === this.player.actions[0].kind) || this.actions.hasAbilityToUse('Tower', this.player)))) {
            var alreadyHas = false;
            this.player.buildings.forEach(function(b) {
              if (b.name === this.player.hand[i].name) alreadyHas = true;
            }, this);
            if (!alreadyHas) moves.push({kind: 'lay', index: i, color: this.player.hand[i].color});
          } else if (this.player.hand[i].name === 'Statue') {
            this.colors.forEach(function(color) {
              if (this.game.sites[color] > 6 - this.game.players.length || (this.game.sites[color] > 0 && ((this.player.actions[1] && this.player.actions[1].kind === this.player.actions[0].kind) || this.actions.hasAbilityToUse('Tower', this.player)))) {
                var alreadyHas = false;
                this.player.buildings.forEach(function(b) {
                  if (b.name === 'Statue') alreadyHas = true;
                }, this);
                if (!alreadyHas) moves.push({kind: 'lay', index: i, color: color});
              }
            }, this);
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
        if (this.canAddToStructure(this.player.hand[i].color, this.player.buildings[j], this.game.currentPlayer, this.game.currentPlayer)) {
          moves.push({kind: 'fillFromHand', hand: i, building: j, data: {card: this.player.hand[i], index: i}});
        }
      }
      if (this.player.hand[i].color !== 'black') {
        if (this.game.sites[this.player.hand[i].color] > 6 - this.game.players.length || (this.game.sites[this.player.hand[i].color] > 0 && ((this.player.actions[1] && this.player.actions[1].kind === this.player.actions[0].kind) || this.actions.hasAbilityToUse('Tower', this.player)))) {
          var alreadyHas = false;
          this.player.buildings.forEach(function(b) {
            if (b.name === this.player.hand[i].name) alreadyHas = true;
          }, this);
          if (!alreadyHas) moves.push({kind: 'lay', index: i, color: this.player.hand[i].color});
        }
      }
    }

    if (!moves.length || !this.testNoSkip) moves.push({kind:'skip'});

    return moves;
  }

  architect() {
    // stairway and archway
    var moves = [];
    if (!this.player.actions[0].usedRegularArchitect) {
      // check if can add anything to structures
      var considered = {'yellow': false, 'green': false, 'red': false, 'grey': false, 'blue': false, 'purple': false};
      for (var i = 0; i < this.player.stockpile.length; i++) {
        for (var j = 0; j < this.player.buildings.length; j++) {
          if (!considered[this.player.stockpile[i]] && this.canAddToStructure(this.player.stockpile[i], this.player.buildings[j], this.game.currentPlayer, this.game.currentPlayer)) {
            moves.push({kind: 'fillFromStockpile', stockpile: i, building: j, data: {material: this.player.stockpile[i], index: i}, player: this.game.currentPlayer});
            considered[this.player.stockpile[i]] = true;
          }
        }
      }
      //archway
      if (this.actions.hasAbilityToUse('Archway', this.player)) {
        this.colors.forEach(function(color) {
          for (var j = 0; j < this.player.buildings.length; j++) {
            if (this.game.pool[color] && this.canAddToStructure(color, this.player.buildings[j], this.game.currentPlayer, this.game.currentPlayer)) {
              moves.push({kind: 'fillFromPool', color: color, building: j, player: this.game.currentPlayer});
            }
          }
        }, this);
      }
      // check if can lay foundation
      for (var i = 0; i < this.player.hand.length; i++) {
        if (this.player.hand[i].color !== 'black') {
          if (this.player.hand[i].name !== 'Statue' && this.game.sites[this.player.hand[i].color] > 6 - this.game.players.length || (this.game.sites[this.player.hand[i].color] > 0 && ((this.player.actions[1] && this.player.actions[1].kind === this.player.actions[0].kind) || this.actions.hasAbilityToUse('Tower', this.player)))) {
            var alreadyHas = false;
            this.player.buildings.forEach(function(b) {
              if (b.name === this.player.hand[i].name) alreadyHas = true;
            }, this);
            if (!alreadyHas) moves.push({kind: 'lay', index: i, color: this.player.hand[i].color});
          }
          else if (this.player.hand[i].name === 'Statue') {
            this.colors.forEach(function(color) {
              if (this.game.sites[color] > 6 - this.game.players.length || (this.game.sites[color] > 0 && ((this.player.actions[1] && this.player.actions[1].kind === this.player.actions[0].kind) || this.actions.hasAbilityToUse('Tower', this.player)))) {
                var alreadyHas = false;
                this.player.buildings.forEach(function(b) {
                  if (b.name === 'Statue') alreadyHas = true;
                }, this);
                if (!alreadyHas) moves.push({kind: 'lay', index: i, color: color});
              }
            }, this);
          }
        }
      }
    }

    if (this.actions.hasAbilityToUse('Stairway', this.player) && !this.player.actions[0].usedStairway) {
      // check if can add anything to structures
      var considered = {'yellow': false, 'green': false, 'red': false, 'grey': false, 'blue': false, 'purple': false};
      for (var i = 0; i < this.player.stockpile.length; i++) {
        for (var k = 0; k < this.game.players.length; k++) {
          for (var j = 0; j < this.game.players[k].buildings.length; j++) {
            if (!considered[this.player.stockpile[i]] && this.game.currentPlayer !== k && this.canAddToStructure(this.player.stockpile[i], this.game.players[k].buildings[j], this.game.currentPlayer, k)) {
              moves.push({kind: 'fillFromStockpile', stockpile: i, building: j, data: {material: this.player.stockpile[i], index: i}, player: k});
              considered[this.player.stockpile[i]] = true;
            }
          }
        }
      }
      //archway
      if (this.actions.hasAbilityToUse('Archway', this.player)) {
        this.colors.forEach(function(color) {
          for (var k = 0; k < this.game.players.length; k++) {
            for (var j = 0; j < this.game.players[k].buildings.length; j++) {
              if (k !== this.game.currentPlayer && this.game.pool[color] && this.canAddToStructure(color, this.game.players[k].buildings[j], this.game.currentPlayer, k)) {
                moves.push({kind: 'fillFromPool', color: color, building: j, player: k});
              }
            }
          }
        }, this);
      }
    }

    if (!moves.length || !this.testNoSkip) moves.push({kind:'skip'});

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
    if (!moves.length || !this.testNoSkip) moves.push({kind: 'skip'});
    return moves;
  }

  romeDemands() {
    //palisade and wall
    var moves = [];

    var immune = this.actions.hasAbilityToUse('Wall', this.player) || (this.actions.hasAbilityToUse('Palisade', this.player) && !this.actions.hasAbilityToUse('Bridge', this.game.players[this.player.actions[0].demander]));
    
    if (!immune) {
      var color = this.player.actions[0].material;
      for (var i = 0; i < this.player.hand.length; i++) {
        if (this.player.hand[i].color == color) {
          moves.push({kind: 'romeDemands', index: i, data: {index: i, card: this.player.hand[i]}});
        }
      }
    }
    if (!moves.length) moves.push({kind: 'skip'});

    return moves;
  }

  think() {
    var moves = [];
    if (this.game.pool['black']) moves.push({kind: 'takeJack'});
    moves.push({kind: this.player.hand.length < this.actions.handLimit(this.player) ? 'refill' : 'drawOne' });
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
    if (!moves.length || !this.testNoSkip) moves.push({kind: 'skip'});
    return moves;
  }

  prison() {
    var moves = [];
    for (var k = 0; k < this.game.players.length; k++) {
      for (var j = 0; j < this.game.players[k].buildings.length; j++) {
        // check if player already has that building
        if (k !== this.game.currentPlayer) {
          var doesntHave = true;
          this.player.buildings.forEach(function(building) {
            if (building.name === this.game.players[k].buildings[j].name) {
              doesntHave = false;
            }
          }, this);
          if (this.game.players[k].buildings[j].done && doesntHave) {
            moves.push({kind: 'prison', building: this.game.players[k].buildings[j], opponent: k, index: j});
          }
        }
      }
    }
    if (!moves.length || !this.testNoSkip) moves.push({kind: 'skip'});
    return moves;
  }

  canAddToStructure(color, structure, player, owner) {
    if (color === 'black') return false;
    else if ((player === owner) === (structure.done)) return false;
    else if (player !== owner && this.game.players[player].publicBuildings.indexOf(structure.name) >= 0) return false;
    else if (color === structure.siteColor) return true;
    else if (color === 'yellow' && this.actions.hasAbilityToUse('Tower', this.game.players[player])) return true;
    else if (structure.siteColor === 'blue' && this.actions.hasAbilityToUse('Road', this.game.players[player])) return true;
    else if (!structure.done && color === 'purple' && this.actions.hasAbilityToUse('Scriptorium', this.game.players[player])) return true;
    else return false;
  }
}

module.exports = function(game, current) {
  var g = new LegalMoves(game, current);
  return g.moveset();
}