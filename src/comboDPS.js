const Pokemon = require('../json/pokemon.json')
const LevelToCPM = require('../json/level-to-cpm.json')
const getTypeEffectiveness = require('./getTypeEffectiveness').getTypeEffectiveness

function getDmgVs(obj) {
  const atk = obj.atk
  const def = obj.def
  const moves = obj.moves
  const player = obj.player
  const opponent = obj.opponent
  const pokemonLevel = obj.pokemonLevel || 25

  // We determine DPS combo vs a level 25 pokemon because that's what gyms on average will have.
  // There's no hard data for this claim btw, it's completely made up.
  const opponentLevel = obj.opponentLevel || 25

  const AtkECpM = LevelToCPM[pokemonLevel]
  const DefECpM = LevelToCPM[opponentLevel]

  return moves.map((move) => {
    const stab = move.Type === player.type1 || move.Type === player.type2 ? 1.25 : 1
    const power = move.Power

    const fxMul = getTypeEffectiveness(opponent, move)

    return Math.floor(0.5 * (atk * AtkECpM) / (def * DefECpM) * power * stab * fxMul) + 1
  })
}

function getDPS(dmg, duration) {
  return (dmg / (duration / 1000)) || 0
}

function battleDPS(obj) {
  const atk = obj.atk
  const def = obj.def
  const level = obj.pokemonLevel
  const moves = obj.moves

  const quickHits = Math.ceil(100 / moves[0].Energy)
  const chargeHits = Math.abs(Math.ceil(100 / moves[1].Energy))

  const quickTimeFor100Charge = quickHits * moves[0].DurationMs
  const timeToCharge = chargeHits * moves[1].DurationMs

  const dmg = getDmgVs(obj)

  const quickDmg = dmg[0] * quickHits
  const chargeDmg = dmg[1] * chargeHits

  const dps = getDPS(chargeDmg + quickDmg, quickTimeFor100Charge + timeToCharge)

  const gymQuickTimeFor100Charge = (quickHits - 2) * 2000 + 2000 + quickTimeFor100Charge
  const gymDPS = getDPS(chargeDmg + quickDmg, gymQuickTimeFor100Charge + timeToCharge + 2000)

  return {
    combo: {
      name: `${moves[0].Name}/${moves[1].Name}`,
      dps,
      gymDPS,
    },

    energy100info: {
      quickHits,
      chargeHits,
      quickTimeFor100Charge,
      timeToCharge,
      gymQuickTimeFor100Charge,
    },

    quick: {
      name: moves[0].Name,
      dmg: dmg[0],
      dps: getDPS(dmg[0], moves[0].DurationMs),
      gymDPS: getDPS(dmg[0], 2000 + moves[0].DurationMs),
    },

    charge: {
      name: moves[1].Name,
      dmg: dmg[1],
      dps: getDPS(dmg[1], moves[1].DurationMs),
      gymDPS: getDPS(dmg[1], 2000 + moves[1].DurationMs),
    },
  }
}

// IndAtk is the attacking pokemon's (mon) IV attack
// IndDef is the defeneding pokemon's (opponent) IV defense
function comboDPS(mon, opponent, IndAtk, IndDef, pokemonLevel, opponentLevel, move1, move2) {
  const def = opponent.stats.defense + IndDef

  const atk = mon.stats.attack + IndAtk

  return battleDPS({
    atk,
    def,
    player: mon,
    opponent,
    pokemonLevel,
    opponentLevel,
    moves: [move1, move2],
  })
}

module.exports = comboDPS

console.log(
  comboDPS(
    Pokemon.filter(x => x.name === 'VAPOREON')[0],
    Pokemon.filter(x => x.name === 'FLAREON')[0],
    10,
    10,
    25,
    25,
    Pokemon.filter(x => x.name === 'VAPOREON')[0].moves1[0],
    Pokemon.filter(x => x.name === 'VAPOREON')[0].moves2[1]
  )
)
