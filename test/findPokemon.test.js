const test = require('ava');

const findPokemon = require('../lib/findPokemon');

test('find by name', t => {
  const poke = findPokemon('bulbasaur');
  t.is(poke.name, 'BULBASAUR');
});

test('find by partial name', t => {
  const poke = findPokemon('zard');
  t.is(poke.name, 'CHARIZARD');
});

test('find by mangled name', t => {
  const poke = findPokemon('mrmime');
  t.is(poke.name, 'MR_MIME');

  const poke2 = findPokemon('zados');
  t.is(poke2.name, 'ZAPDOS');
});

test('does not find gibberish', t => {
  const poke = findPokemon('ø∆∑∆∫˙¬åΩ≈Ωπœœ¥®øß');
  t.is(poke, null);
});
