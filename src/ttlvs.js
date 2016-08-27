const dpsvs = require('./dpsvs')
const hp = require('./hp')
const LevelToCPM = require('../json/level-to-cpm')

// Find a Pokemon's TTL vs an opponent. This is how much damage they'll do and how long they'll
// take to wipe out an enemy vs how long they can stand against said opponent.
function ttlvs(player, opponent, ivs, pokemonLevel) {
  const IndAtk = ivs.IndAtk
  const IndDef = ivs.IndDef
  const IndSta = ivs.IndSta

  // In order to do a diff we'll take the opponent's best move vs you
  // assuming they have an attack IV of 10 and they're level 25.
  const opponentLevel = 25
  const opponentsBestMove = dpsvs(opponent, player, 10, IndDef, opponentLevel, pokemonLevel)[0]
  // Then we multiply by 0.75 because gym opponents only attack every 1.5 seconds
  const opponentDPS = opponentsBestMove.dps * 0.75

  // the opponent's HP
  const playerHP = hp.getHP(player, IndSta, LevelToCPM[pokemonLevel])
  const opponentHP = hp.getHP(opponent, 10, LevelToCPM['25'])

  const playerTTL = playerHP / opponentDPS

  return dpsvs(player, opponent, IndAtk, IndDef, pokemonLevel, opponentLevel).map((x) => {
    const opponentTTL = opponentHP / x.dps
    const hpRemaining = playerHP - (opponentDPS * opponentTTL)
    const hpLoss = playerHP - hpRemaining

    return {
      quick: x.quick,
      charge: x.charge,
      scores: {
        netTTL: playerTTL - opponentTTL,
        hpRemaining,
        hpLoss,
      },
      dps: {
        player: x.dps,
        opponent: opponentDPS,
      },
      hp: {
        player: playerHP,
        opponent: opponentHP,
      },
      ttl: {
        player: playerTTL,
        opponent: opponentTTL,
      },
    }
  })
}

module.exports = ttlvs

// const Pokemon = require('../json/pokemon')
// console.log(
//   ttlvs(
//     Pokemon.filter(x => x.name === 'GYARADOS')[0],
//     Pokemon.filter(x => x.name === 'DRAGONITE')[0],
//     { IndAtk: 10, IndDef: 10, IndSta: 10 },
//     25
//   )
// )
