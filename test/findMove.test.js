const test = require('ava');

const findMove = require('../lib/findMove');

test('find by name', t => {
  const move = findMove('BULLET_SEED_FAST');
  t.is(move.Name, 'BULLET_SEED_FAST');
});

test('short name', t => {
  const move = findMove('hbm');
  t.is(move.Name, 'HYPER_BEAM');
});

test('no _FAST', t => {
  const move = findMove('counter');
  t.is(move.Name, 'COUNTER_FAST');
});

test('does not exist', t => {
  const move = findMove('tickle bomb');
  t.is(move, null);
});
