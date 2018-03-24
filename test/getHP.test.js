const test = require('ava');

const getHP = require('../lib/getHP');

test(t => {
  const hp = getHP(
    {
      stats: {
        attack: 200,
        defense: 200,
        stamina: 200,
      },
    },
    15,
    0.79030001
  );

  t.is(169, hp);
});
