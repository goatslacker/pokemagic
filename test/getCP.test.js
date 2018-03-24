const test = require('ava');

const getCP = require('../lib/getCP');

test(t => {
  const cp = getCP(
    {
      stats: {
        attack: 200,
        defense: 200,
        stamina: 200,
      },
    },
    0xfff,
    0.79030001
  );

  t.is(2887, cp);
});
