const test = require('ava');

const typeRankings = require('../lib/typeRankings');

test(t => {
  const rank = typeRankings('ELECTRIC');

  t.is(rank[0].name, 'RAIKOU');
});
