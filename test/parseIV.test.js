const test = require('ava');

const parseIV = require('../lib/parseIV');

test(t => {
  const p = parseIV(0xfff);
  t.is(p.atk, 15);
  t.is(p.def, 15);
  t.is(p.sta, 15);

  const z = parseIV(0x000);
  t.is(z.atk, 0);
  t.is(z.def, 0);
  t.is(z.sta, 0);

  const b = parseIV(0xaaa);
  t.is(b.atk, 10);
  t.is(b.def, 10);
  t.is(b.sta, 10);

  const x = parseIV(0x420);
  t.is(x.atk, 4);
  t.is(x.def, 2);
  t.is(x.sta, 0);
});
