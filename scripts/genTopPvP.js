const fs = require('fs');

const simulateBattle = require('../simulateBattle');

const topPokemon = require('../lib/topPokemon');

function fightAll(f, id = 0) {
  const atk = topPokemon[id];
  const battles = [];

  if (id >= topPokemon.length) {
    return battles;
  }

  for (let i = id + 1; i < topPokemon.length; i += 1) {
    const def = topPokemon[i];
    battles.push(f(atk, def));
  }

  return battles.concat(fightAll(f, id + 1));
}

fs.writeFileSync(
  './json/pvp.json',
  JSON.stringify(
    fightAll((atk, def) => {
      const battle = simulateBattle(
        {
          key: `${atk.id}.40.fff.0.0`,
        },
        {
          key: `${def.id}.40.fff.0.0`,
        },
        {
          pvp: true,
          skipLog: true,
        }
      );

      return {
        key: `${battle.atk.key}v${battle.def.key}`,
        atk: battle.atk.dmgDealt,
        def: battle.def.dmgDealt,
        ms: battle.timeElapsed,
      };
    })
  )
);
