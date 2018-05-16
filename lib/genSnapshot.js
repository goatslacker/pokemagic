const simulateBattle = require('./simulateBattle');
const topPokemon = require('./topPokemon');

// Mewtwo : Confusion / Shadow Ball
const atk = '150.40.fff.1.1';

// vs every other top pokemon
const testCases = topPokemon.map(def => {
  return {
    atk,
    def: `${def.id}.40.fff.0.0`,
  };
});

function snapshots() {
  // grab the first 20 events in the log
  return testCases.map(({ atk, def }) => {
    const key = `${atk}v${def}`;
    const data = simulateBattle.fromKey(key);
    return {
      key,
      log20: data.log.slice(0, 20),
    };
  });
}

module.exports = snapshots;
