const test = require('ava');

const findPokemon = require('../lib/findPokemon');
const simulateBattle = require('../lib/simulateBattle');

test(t => {
  const stats = simulateBattle(
    {
      iv: 0xfff,
      lvl: 40,
      name: 'exeggutor',
      move1: 'bullet seed',
      move2: 'solar beam',
    },
    {
      iv: 0xfff,
      lvl: 40,
      name: 'gyarados',
      move1: 'waterfall',
      move2: 'hydro pump',
    },
    {}
  );

  t.is(stats.winner, 'atk');
  t.is(stats.timedOut, false);
  t.is(stats.timeElapsed, 23450);

  t.is(stats.atk.id, 103);
  t.is(stats.atk.name, 'EXEGGUTOR');
  t.is(stats.atk.cp, 2916);
  t.is(stats.atk.dmgDealt, 324);

  t.is(stats.def.id, 130);
  t.is(stats.def.name, 'GYARADOS');
  t.is(stats.def.cp, 3281);
  t.is(stats.def.dmgDealt, 141);

  t.is(Array.isArray(stats.log), true);

  t.is(stats.log[0].m, 'BULLET_SEED_FAST');
  t.is(stats.log[0].ms, 98450);
  t.is(stats.log[1].m, 'WATERFALL_FAST');
  t.is(stats.log[1].ms, 97450);
});
