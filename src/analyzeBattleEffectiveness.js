const Pokemon = require('../json/pokemon.json')
const LevelToCPM = require('../json/level-to-cpm.json')
const gymDefenders = require('../json/gym-defenders.json')
const ttlvs = require('./ttlvs')
const getTypeEffectiveness = require('./getTypeEffectiveness').getTypeEffectiveness

const GymPokemon = gymDefenders.map(def => Pokemon.filter(x => x.name === def.name)[0])

// A function that analyzes how effective a pokemon is in battle vs another pokemon
// This uses a list of top pokemon to use at gyms and pits your pokemon vs them.
function analyzeBattleEffectiveness(obj) {
  const pokemonName = obj.name
  const pokemonLevel = obj.level

  const fmtName1 = pokemonName.toUpperCase().trim()
  const player = Pokemon.filter(x => x.name === fmtName1)[0]

  if (!player) throw new Error(`Cannot find ${fmtName1}`)

  // Pit the Pokemon vs the "Top Defenders" gym list and see how the Pokemon does.
  // but only for favorable matchups, because frankly why would you use an
  // arcanine to try and take down a vape?
  const defenders = GymPokemon.map((opponent) => {
    const moves = ttlvs(player, opponent, {
      IndAtk: obj.IndAtk,
      IndDef: obj.IndDef,
      IndSta: obj.IndSta,
    }, pokemonLevel || 25)

    return {
      vs: opponent.name,
      best: {
        moves: `${moves[0].quick}/${moves[0].charge}`,
        dps: moves[0].dps.player,
        ttl: moves[0].scores.netTTL,
      },
      moves: moves.reduce((moveSets, move) => {
        const movesName = `${move.quick}/${move.charge}`
        moveSets[movesName] = {
          dps: move.dps.player,
          ttl: move.scores.netTTL,
        }
        return moveSets
      }, {}),

      type1: opponent.type1,
      type2: opponent.type2,
      moves1: opponent.moves1,
      moves2: opponent.moves2,
    }
  }).sort((a, b) => a.best.ttl > b.best.ttl ? -1 : 1)

  const idealDefenders = defenders.filter((opponent) => {
    const opponentOk1 = opponent.moves1.some(move => getTypeEffectiveness(player, move) <= 1)
    const opponentOk2 = opponent.moves2.some(move => getTypeEffectiveness(player, move) <= 1)
    const playerOk1 = player.moves1.some(move => getTypeEffectiveness(opponent, move) >= 1)
    const playerOk2 = player.moves2.some(move => getTypeEffectiveness(opponent, move) >= 1)

    return opponentOk1 && opponentOk2 && playerOk1 && playerOk2
  })

  // Get the average DPS of each move
  const movesTotal = idealDefenders.reduce((obj, x) => {
    Object.keys(x.moves).forEach((moveName) => {
      if (!obj[moveName]) obj[moveName] = 0
      obj[moveName] = obj[moveName] + x.moves[moveName].dps
    })
    return obj
  }, {})
  const movesSorted = Object.keys(movesTotal).sort((a, b) => {
    return movesTotal[a] > movesTotal[b] ? -1 : 1
  })
  const avgMoves = movesSorted.reduce((obj, moveName) => {
    obj[moveName] = movesTotal[moveName] / idealDefenders.length
    return obj
  }, {})

  // Get the average TTL of each move
  const ttlTotal = idealDefenders.reduce((obj, x) => {
    Object.keys(x.moves).forEach((moveName) => {
      if (!obj[moveName]) obj[moveName] = 0
      obj[moveName] = obj[moveName] + x.moves[moveName].ttl
    })
    return obj
  }, {})
  const ttlSorted = Object.keys(ttlTotal).sort((a, b) => {
    return ttlTotal[a] > ttlTotal[b] ? -1 : 1
  })
  const avgTTL = ttlSorted.reduce((obj, moveName) => {
    obj[moveName] = ttlTotal[moveName] / idealDefenders.length
    return obj
  }, {})

  // Let's find out the "most useful" moveset. This is the one that is most general
  const moveComboUsefulness = defenders.reduce((obj, k) => {
    if (!obj[k.best.moves]) obj[k.best.moves] = 0
    obj[k.best.moves] += 1
    return obj
  }, {})

  // we want our Pokemon to have a net TTL of at least 0
  // that is considered "good vs"
  const GOOD_VS_THRESHOLD = 0

  if (obj.moves) {
    const moveComboName = `${obj.moves.quick}/${obj.moves.charge}`
    return {
      name: fmtName1,
      dps: avgMoves[moveComboName],
      ttl: avgTTL[moveComboName],
      breakdown: defenders.reduce((obj, x) => {
        obj[x.vs] = x.moves[moveComboName]
        return obj
      }, {}),
    }
  }

  return {
    name: fmtName1,
    bestAvgDPS: avgMoves[movesSorted[0]],
    bestAvgTTL: avgTTL[ttlSorted[0]],
    avgMoves,
    avgTTL,
    moveComboUsefulness,
    breakdown: defenders.reduce((obj, x) => {
      obj[x.vs] = x.best
      return obj
    }, {}),
  }
}

module.exports = analyzeBattleEffectiveness

//console.log(
//  analyzeBattleEffectiveness({
//    name: 'tentacruel',
//    level: 25,
//    IndAtk: 10,
//    IndDef: 10,
//    IndSta: 10,
//    moves: {
//      quick: 'WATER_GUN_FAST',
//      charge: 'HYDRO_PUMP',
//    },
//  })
//)
