const addTMCombinations = require('./addTMCombinations');
const effectivenessList = require('./effectivenessList');
const getRaidInfo = require('./raid');
const simulateBattle = require('./simulateBattle');
const topPokemon = require('./topPokemon');

function sortByScore(a, b) {
  // Pick the highest score
  if (a.score !== b.score) {
    return a.score > b.score ? -1 : 1;
  }

  // Then pick the one with the best health loss (less is more)
  if (a.hp !== b.hp) {
    return a.hp > b.hp ? 1 : -1;
  }

  // Then pick the best time
  if (a.time !== b.time) {
    return a.time > b.time ? -1 : 1;
  }

  // Finally, pick the one where the attacker deals the most damage
  if (a.dmg !== b.dmg) {
    return a.dmg > b.dmg ? -1 : 1;
  }

  // Otherwise it's a tie
  return 0;
}

function scoreHPLoss(combat) {
  return (
    // If the attacker wins then smallest HP loss is best
    combat.winner === 'atk'
      ? 1000 - combat.atk.dmgTaken
      : // If the defense wins then there's no point
        combat.winner === 'def' ? Math.log(combat.def.dmgTaken) * 0.01 : 0
  );
}

function scoreRaid(fight) {
  return fight.def.dmgTaken;
}

function scoreTimeRemaining(combat) {
  return (
    // If the attacker wins then smallest HP loss is best
    combat.winner === 'atk'
      ? combat.timeRemaining
      : // If the defense wins then there's no point
        combat.winner === 'def' ? Math.log(combat.def.dmgTaken) * 0.1 : 0
  );
}

function getKOPercentage(combat, scoring) {
  const score = scoring === 'raid' ? scoreRaid(combat) : combat.def.dmgTaken;
  return Math.min(Math.round(score / combat.def.hp * 1000) / 10, 100);
}

function getCounters(pokeDef, optionsOverride) {
  const options = Object.assign(
    {
      filterDefenderMoveset: () => true, // Include all moves by default
      legacy: true, // Do we include legacy moves?
      pvp: false,
      raidInfo: null,
      scoring: 'hp', // How do we score matches? [hp, time]
      sortingMethod: sortByScore, // Sort by best moveset
      tm: true, // Do we include moves only accessible via TM?
      weather: 'EXTREME',
    },
    optionsOverride
  );

  const filterMoveset = move =>
    [options.tm || !move.tm, options.legacy || !move.retired].every(Boolean);

  // Format
  // [
  //   {
  //     A: 'QuickMove',
  //     B: 'ChargeMove',
  //     tm: Boolean,
  //     retired: Boolean,
  //   },
  // ]
  const defMovesArr = addTMCombinations(pokeDef).filter(
    options.filterDefenderMoveset
  );

  const counters = {};

  defMovesArr.forEach(defMoves => {
    const defKey = `${defMoves.A}/${defMoves.B}`;
    counters[defKey] = [];
  });

  topPokemon.forEach(pokeAtk => {
    const atkMovesArr = addTMCombinations(pokeAtk).filter(filterMoveset);

    defMovesArr.forEach(defMoves => {
      const defKey = `${defMoves.A}/${defMoves.B}`;

      atkMovesArr.forEach(atkMoves => {
        const combat = simulateBattle(
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
          {
            pvp: options.pvp,
            raid: options.raidInfo,
            weather: options.weather,
          }
        );

        // Generate a score
        const score =
          options.scoring === 'hp'
            ? scoreHPLoss(combat)
            : options.scoring === 'raid'
              ? scoreRaid(combat)
              : scoreTimeRemaining(combat);

        const stats = {
          dmg: combat.def.dmgTaken,
          hp: combat.atk.dmgTaken,
          kop: getKOPercentage(combat, options.scoring),
          moves: combat.atk.moves,
          name: combat.atk.name,
          retired: atkMoves.retired,
          score,
          time: combat.timeElapsed / 1000,
          tm: atkMoves.tm,
        };

        counters[defKey].push(stats);
      });
    });
  });

  const counterKeys = Object.keys(counters);
  if (!counterKeys.length) return null;

  counterKeys.forEach(key => counters[key].sort(options.sortingMethod));

  return counters;
}

const ucFirst = x => x[0].toUpperCase() + x.slice(1).toLowerCase();

function collectTopPokes(counters, maxPokemon) {
  const map = {};

  Object.keys(counters).forEach(key => {
    const index = {};
    let pokemonFound = 0;
    map[key] = [];

    counters[key].every(stats => {
      const { name } = stats;

      if (!index.hasOwnProperty(name)) {
        index[name] = pokemonFound;
        map[key][pokemonFound] = [];
        pokemonFound += 1;
      }

      map[key][index[name]].push(stats);

      return pokemonFound < maxPokemon;
    });
  });

  return map;
}

const cache = {};
function defenderProfile(poke, quickMove, chargeMove, options = {}) {
  const isRaid = !!options.raid;
  const isPvP = !!options.pvp;

  // Pokemon search
  if (!poke) return null;

  let filterDefenderMoveset = () => true;
  let moveText = 'ALL';
  if (quickMove && chargeMove) {
    filterDefenderMoveset = x => x.A === quickMove && x.B === chargeMove;
    moveText = `${quickMove}/${chargeMove}`;
  }

  const cacheKey = `${poke.id}/${moveText}/${isRaid}-${isPvP}`;
  if (cache.hasOwnProperty(cacheKey)) return cache[cacheKey];

  // Type information for display
  const typeArr = effectivenessList(poke);
  const superEffective = typeArr.superEffective.map(ucFirst);
  const notEffective = typeArr.notEffective.map(ucFirst);
  const immune = typeArr.immune.map(ucFirst);

  const raidInfo = isRaid ? getRaidInfo(poke) : null;

  // The counters info
  const counters = getCounters(poke, {
    filterDefenderMoveset,
    legacy: true,
    pvp: isPvP,
    raidInfo,
    scoring: isRaid ? 'raid' : 'hp',
    sortingMethod: sortByScore,
    tm: true,
    weather: options.weather,
  });

  if (!counters) return null;

  const topCounters = collectTopPokes(
    counters,
    !quickMove || !chargeMove ? 3 : 5
  );

  const info = {
    counters: topCounters,
    immune,
    notEffective,
    superEffective,
  };

  cache[cacheKey] = info;
  return cache[cacheKey];
}

module.exports = defenderProfile;
