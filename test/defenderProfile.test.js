const test = require('ava');

const defenderProfile = require('../lib/defenderProfile');

test(t => {
  const profile = defenderProfile('kyogre', null, null, {
    raid: true,
    weather: 'EXTREME',
  });

  const quick = 'WATERFALL_FAST';
  const charge = 'THUNDER';

  const countersForWT = profile.counters.find(
    res => res.quick === quick && res.charge === charge
  );

  t.is(!!countersForWT, true);

  const raikouStats = countersForWT.results.find(res => res.name === 'RAIKOU');

  t.is(raikouStats.stats[0].moves[0], 'THUNDER_SHOCK_FAST');
  t.is(raikouStats.stats[0].moves[1], 'WILD_CHARGE');
});
