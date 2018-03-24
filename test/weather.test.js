const test = require('ava');

const weather = require('../lib/weather');

test(t => {
  t.is(weather('foggy', 'dark'), 1.2);
  t.is(weather('foggy', 'fighting'), 1);
});
