const Levels = require('../json/levels');

const getCP = require('./getCP');
const getHP = require('./getHP');
const parseIV = require('./parseIV');

/*
const IV_RANGE = {
  great: [82, 100],
  good: [67, 81],
  bad: [51, 66],
  ugly: [0, 50],
};

const STAT_RANGE = {
  great: [14, 15],
  good: [12, 13],
  bad: [8, 9, 10, 11],
  ugly: [0, 1, 2, 3, 4, 5, 6, 7],
};

const VALOR = {
  overall: [
    'Overall, your Pokemon simply amazes me. It can accomplish anything!',
    'Overall, your Pokemon is a strong Pokemon. You should be proud!',
    'Overall, your Pokemon is a decent Pokemon.',
    'Overall, your Pokemon may not be great in battle, but I still like it!',
  ],

  highestStat: [
    "I'm blown away by its stats. WOW!",
    "It's got excellent stats! How exciting!",
    "Its stats indicate that in battle, it'll get the job done.",
    "Its stats don't point to greatness in battle.",
  ],
};
*/

function getPossibleStaminaValues(pokemon, hp, cpm) {
  return Array.from(Array(16))
    .map((_, i) => i)
    .filter(stamina => hp === getHP(pokemon, stamina, cpm));
}

function calculateIV(pokemon, cp, hp, lvl) {
  const cpm = Levels[String(lvl)];
  const dec = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'];

  const staminaValues = getPossibleStaminaValues(pokemon, hp, cpm);

  const matches = [];

  staminaValues.forEach(staIndex => {
    dec.forEach(atk => {
      dec.forEach(def => {
        const iv = ['0x', atk, def, dec[staIndex]].join('');
        const testCP = getCP(pokemon, iv, cpm);

        if (testCP === cp) {
          matches.push(parseIV(iv));
        }
      });
    });
  });

  return matches;
}

module.exports = calculateIV;
