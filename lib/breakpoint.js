const Levels = require('../json/levels');
const Moves = require('../json/moves');
const getMaxCP = require('./getMaxCP');
const getRaidInfo = require('./raid');
const getTypeEffectiveness = require('./getTypeEffectiveness');
const findPokemon = require('./findPokemon');

function getDMG(move, pokeAtk, pokeDef, atkCPM, defCPM) {
  const stab =
    move.Type === pokeAtk.type1 || move.Type === pokeAtk.type2 ? 1.2 : 1;
  const power = move.Power || 0;

  const atk = (pokeAtk.stats.attack + 15) * atkCPM;
  const def = (pokeDef.stats.defense + 15) * defCPM;

  const effectiveness = getTypeEffectiveness(pokeDef, move);
  const dmg = Math.floor(0.5 * power * (atk / def) * stab * effectiveness) + 1;

  return dmg;
}

const tableArr = Array.from(Array(41)).map((x, i) => i / 2 + 20);

function dmgForMove(pokeAtk, pokeDef, move, defECpM) {
  const table = {};
  const results = [];

  tableArr.forEach(lvl => {
    const dmg = getDMG(move, pokeAtk, pokeDef, Levels[lvl], defECpM);

    if (!table[dmg]) {
      const cp = getMaxCP(pokeAtk, lvl);
      const prev = getDMG(move, pokeAtk, pokeDef, Levels['20'], defECpM);
      const pct = prev ? Math.abs((prev - dmg) / prev * 100).toFixed(2) : '0';
      table[dmg] = 1;
      results.push({ dmg, cp, lvl, pct });
    }
  });

  return results.sort((a, b) => (a.dmg > b.dmg ? -1 : 1));
}

function breakpoint(pokeAtkName, pokeDefName, raidTier) {
  const pokeAtk = findPokemon(pokeAtkName);
  const pokeDef = findPokemon(pokeDefName);
  const raidInfo = getRaidInfo(pokeDef, raidTier);

  const defECpM = raidInfo ? raidInfo.cpm : Levels['40'];

  const atk = pokeAtk.moves.quick.map(quickMove => ({
    move: quickMove,
    table: dmgForMove(pokeAtk, pokeDef, Moves[quickMove], defECpM),
  }));
  const def = pokeDef.moves.quick.map(quickMove => ({
    move: quickMove,
    table: dmgForMove(pokeDef, pokeAtk, Moves[quickMove], defECpM),
  }));

  return { atk, def };
}

module.exports = breakpoint;
