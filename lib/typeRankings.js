const Moves = require('../json/moves');

const addTMCombinations = require('./addTMCombinations');
const simulateBattle = require('./simulateBattle');
const topPokemon = require('./topPokemon');
const getTypeEffectiveness = require('./getTypeEffectiveness');

const ALL_MOVES = {};
topPokemon.forEach(poke => {
  ALL_MOVES[poke.name] = addTMCombinations(poke);
});

function sortByScore(a, b) {
  if (a.score !== b.score) {
    return a.score > b.score ? -1 : 1;
  }
  return 0;
}

function createTally() {
  return {
    dmg: 0,
    hp: 0,
    time: 0,
    wins: 0,
    count: 0,
  };
}

function reduceScore(acc, next) {
  return {
    dmg: acc.dmg + next.dmg,
    hp: acc.hp + next.hp,
    time: acc.time + next.time,
    wins: acc.wins + next.wins,
    count: acc.count + 1,
  };
}

function round(num) {
  return Number(num.toFixed(1));
}

function tallyResults(battleStats) {
  const results = [];
  const movesets = {};

  battleStats.forEach(battle => {
    const key = battle.moves.join('/');
    if (!movesets[key]) movesets[key] = createTally();

    movesets[key] = reduceScore(movesets[key], {
      dmg: battle.dmg,
      hp: battle.hp,
      time: battle.time,
      wins: Number(battle.won),
    });
  });

  Object.keys(movesets).forEach(movesKey => {
    const moves = movesKey.split('/');
    const result = movesets[movesKey];

    results.push(
      Object.assign(
        {
          moves,
          avgHPLoss: round(result.hp / result.count),
          avgTime: round(result.time / result.count / 1000),
          dps: round(result.dmg / (result.time / 1000)),

          score: result.wins,
        },
        result
      )
    );
  });

  results.sort(sortByScore);

  return results;
}

function typeRankings(stype) {
  const type = stype.toUpperCase();

  // Find all pokemon in the top 100 that have that type
  const pokesOfType = topPokemon.filter(
    poke => poke.type1 === type || poke.type2 === type
  );

  // Fight each pokemon vs opponents that are weak/neutral to the type.
  const weakPokemon = topPokemon.filter(
    poke => getTypeEffectiveness(poke, { Type: type }) >= 1
  );

  const Cache = {};

  return pokesOfType
    .map(pokeAtk => {
      Cache[pokeAtk.name] = [];

      // Filter by move combinations where the charge move is same type.
      const movesThatWork = ALL_MOVES[pokeAtk.name].filter(
        atkMoves => Moves[atkMoves.B].Type === type
      );

      movesThatWork.forEach(atkMoves => {
        weakPokemon.forEach(pokeDef => {
          // We'll fight our Pokemon vs all of the opponent's moveset
          // combinations so we can get a fair assessment.
          // The fight is between two 100% level 40 Pokemon.
          ALL_MOVES[pokeDef.name].forEach(defMoves => {
            const fight = simulateBattle(
              {
                iv: 0xfff,
                lvl: 40,
                move1: atkMoves.A,
                move2: atkMoves.B,
                pokemon: pokeAtk,
              },
              {
                iv: 0xfff,
                lvl: 40,
                move1: defMoves.A,
                move2: defMoves.B,
                pokemon: pokeDef,
              },
              {}
            );

            const stats = {
              dmg: fight.def.dmgTaken,
              hp: fight.atk.dmgTaken,
              moves: fight.atk.moves,
              name: fight.atk.name,
              time: fight.timeElapsed,
              won: fight.winner === 'atk',
            };

            Cache[pokeAtk.name].push(stats);
          });
        });
      });

      if (Cache[pokeAtk.name].length === 0) {
        return null;
      }

      // Tally results...
      const results = tallyResults(Cache[pokeAtk.name]);

      // Only use the Pokemon's best moveset
      const best = results[0];

      return Object.assign(
        {
          name: pokeAtk.name,
        },
        best
      );
    })
    .filter(Boolean)
    .sort(sortByScore);
}

module.exports = typeRankings;
