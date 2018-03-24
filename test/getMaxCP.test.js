const test = require('ava');

const getMaxCP = require('../lib/getMaxCP');

test('200', t => {
  const cp = getMaxCP({
    stats: {
      attack: 200,
      defense: 200,
      stamina: 200,
    },
  });

  t.is(2887, cp);
});

test('100', t => {
  const cp = getMaxCP({
    stats: {
      attack: 100,
      defense: 100,
      stamina: 100,
    },
  });

  t.is(825, cp);
});

test('Mewtwo', t => {
  const cp = getMaxCP({
    stats: {
      attack: 300,
      defense: 182,
      stamina: 193,
    },
  });

  t.is(3982, cp);
});
