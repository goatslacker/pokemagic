const test = require('ava');

const findPokemon = require('../lib/findPokemon');
const addTMCombinations = require('../lib/addTMCombinations');

test('adds legacy combinations', t => {
  const combos = addTMCombinations(findPokemon('dragonite'));
  const hasDracoMeteor = combos.some(({ B }) => B === 'DRACO_METEOR');
  t.is(hasDracoMeteor, true);
});
