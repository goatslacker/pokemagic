const test = require('ava');

const getTypeEffectiveness = require('../lib/getTypeEffectiveness');

test('super effective', t => {
  const eff = getTypeEffectiveness(
    {
      type1: 'WATER',
      type2: null,
    },
    {
      Type: 'ELECTRIC',
    }
  );

  t.is(eff, 1.4);
});

test('neutral', t => {
  const eff = getTypeEffectiveness(
    {
      type1: 'NORMAL',
      type2: null,
    },
    {
      Type: 'GRASS',
    }
  );

  t.is(eff, 1);
});

test('not effective', t => {
  const eff = getTypeEffectiveness(
    {
      type1: 'DRAGON',
      type2: null,
    },
    {
      Type: 'FIRE',
    }
  );

  t.is(eff, 0.71);
});
