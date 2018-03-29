const Pokemon = require('../json/pokemon');
const Moves = require('../json/moves');
const findPokemon = require('./findPokemon');
const findMove = require('./findMove');
const topPokemon = require('./topPokemon');

module.exports = {
  findMove,
  findPokemon,
  getAllPokemon() {
    return Pokemon;
  },
  getMoves() {
    return Moves;
  },
  getTopPokemon() {
    return topPokemon;
  },
};
