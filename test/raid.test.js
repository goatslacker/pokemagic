const test = require('ava');

const raid = require('../lib/raid');
const findPokemon = require('../lib/findPokemon');

test(t => {
  const hitmonlee = findPokemon('hitmonlee');

  const obj = raid(hitmonlee, 3);

  t.is(obj.cp, 19679);
});
