const Pokemon = require('../json/pokemon.json')
const LevelToCPM = require('../json/level-to-cpm.json')
const hp = require('./hp')
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

    return (0.5 * (atk * AtkECpM) / (def * DefECpM) * power * stab * fxMul) + 1
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

  const timeToQuick = quickHits * moves[0].DurationMs
  const timeToCharge = chargeHits * moves[1].DurationMs

  const dmg = getDmgVs(obj)

  const quickDmg = dmg[0] * quickHits
  const chargeDmg = dmg[1] * chargeHits

  const dps = getDPS(chargeDmg + quickDmg, timeToQuick + timeToCharge)

  return {
    dps,
    quickHits,
    chargeHits,
    quickDmg,
    chargeDmg,
  }
}

// IndAtk is the attacking pokemon's (mon) IV attack
// IndDef is the defeneding pokemon's (opponent) IV defense
function dpsvs(mon, opponent, IndAtk, IndDef, pokemonLevel, opponentLevel) {
  const moves = []
  const def = opponent.stats.defense + IndDef

  mon.moves1.forEach((move1) => {
    mon.moves2.forEach((move2) => {
      const atk = mon.stats.attack + IndAtk

      const total = battleDPS({
        atk,
        def,
        player: mon,
        opponent,
        pokemonLevel,
        opponentLevel,
        moves: [move1, move2],
      })

      moves.push({
        quick: move1.Name,
        charge: move2.Name,
        dps: total.dps,
      })
    })
  })

  return moves.sort((a, b) => a.dps > b.dps ? -1 : 1)
}

module.exports = dpsvs

/*
console.log(
  dpsvs(
    Pokemon.filter(x => x.name === 'VAPOREON')[0],
    Pokemon.filter(x => x.name === 'FLAREON')[0],
    10,
    10,
    25,
    25
  )
)
*/
