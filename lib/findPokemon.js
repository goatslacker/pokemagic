const Pokemon = require('../json/pokemon');

const scoreSort = require('./scoreSort');

const cache = {};

function findPokemon(uname) {
  if (!uname) return null;

  const num = Number(uname);
  if (!Number.isNaN(num)) {
    return Pokemon[num - 1];
  }

  const name = uname.toUpperCase().replace(/-/g, '_');
  if (cache[name]) return cache[name];

  const poke = scoreSort(Pokemon)(name, x => x.name);
  if (poke) cache[name] = poke;
  return poke;
}

module.exports = findPokemon;
