const test = require('ava');

const findPokemon = require('../lib/findPokemon');
const defenderProfile = require('../lib/defenderProfile');

test(t => {
  const profile = defenderProfile(findPokemon('kyogre'), null, null, {
    raid: true,
    weather: 'EXTREME',
  });

  const moveKey = 'WATERFALL_FAST/THUNDER';

  const raikouMoves = profile.counters[moveKey][0];

  raikouMoves.forEach(move => {
    t.is(move.name, 'RAIKOU');
  });

  t.is(raikouMoves[0].moves[0], 'THUNDER_SHOCK_FAST');
  t.is(raikouMoves[0].moves[1], 'WILD_CHARGE');
});
