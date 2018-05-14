const test = require('ava');

const genSnapshot = require('../lib/genSnapshot');
const snapshot = require('./snapshot');

test(t => {
  t.deepEqual(genSnapshot(), snapshot);
});
