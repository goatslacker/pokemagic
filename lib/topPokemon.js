const Pokemon = require('../json/pokemon');
const getMaxCP = require('./getMaxCP');

const topPokemon = Pokemon.map(poke => ({
  poke,
  cp: getMaxCP(poke),
}))
  .sort((a, b) => (a.cp > b.cp ? -1 : 1))
  .slice(0, 100)
  .map(x => x.poke);

module.exports = topPokemon;
