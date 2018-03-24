const test = require('ava');

const findPokemon = require('../lib/findPokemon');
const calculateIV = require('../lib/calculateIV');

test(t => {
  const matches = calculateIV(findPokemon('MEWTWO'), 3982, 164, 40);

  t.is(matches.length, 1);
  t.is(matches[0].atk, 15);
  t.is(matches[0].def, 15);
  t.is(matches[0].sta, 15);
});
