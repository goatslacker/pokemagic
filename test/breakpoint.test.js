const test = require('ava');

const breakpoint = require('../lib/breakpoint');

test(t => {
  const point = breakpoint('raikou', 'kyogre');

  t.is(!!point.atk, true);
  t.is(!!point.def, true);

  const fiveDMG = point.atk[0].table[0];
  t.is(fiveDMG.dmg, 5);
  t.is(fiveDMG.cp, 3277);
  t.is(fiveDMG.lvl, 38.5);
});

test(t => {
  const point = breakpoint('pikachu', 'flygon');
  t.is(point.atk[0].table.length, 1);
});
