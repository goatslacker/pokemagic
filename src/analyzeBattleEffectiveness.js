const Pokemon = require('../json/pokemon.json')
const LevelToCPM = require('../json/level-to-cpm.json')
const gymDefenders = require('../json/gym-defenders.json')
const ttlvs = require('./ttlvs')

const GymPokemon = gymDefenders.map(def => Pokemon.filter(x => x.name === def.name)[0])

// A function that analyzes how effective a pokemon is in battle vs another pokemon
// This uses a list of top pokemon to use at gyms and pits your pokemon vs them.
function analyzeBattleEffectiveness(pokemonName, ivs, pokemonLevel) {
  const fmtName1 = pokemonName.toUpperCase().trim()
  const player = Pokemon.filter(x => x.name === fmtName1)[0]

  if (!player) throw new Error(`Cannot find ${fmtName1}`)

  // Pit the Pokemon vs the "Top Defenders" gym list and see how the Pokemon does.
  const defenders = GymPokemon.map((opponent) => {
    const moves = ttlvs(player, opponent, ivs, pokemonLevel || 20)

    return {
      vs: opponent.name,
      best: {
        moves: `${moves[0].quick}/${moves[0].charge}`,
        dps: moves[0].dps.player,
        ttl: moves[0].scores.netTTL,
      },
      moves: moves.reduce((moveSets, move) => {
        const movesName = `${move.quick}/${move.charge}`
        moveSets[movesName] = move.dps.player
        return moveSets
      }, {}),
    }
  }).sort((a, b) => a.best.ttl > b.best.ttl ? -1 : 1)

  // Get the average DPS of each move
  const movesTotal = defenders.reduce((obj, x) => {
    Object.keys(x.moves).forEach((moveName) => {
      if (!obj[moveName]) obj[moveName] = 0
      obj[moveName] = obj[moveName] + x.moves[moveName]
    })
    return obj
  }, {})
  const movesSorted = Object.keys(movesTotal).sort((a, b) => {
    return movesTotal[a] > movesTotal[b] ? -1 : 1
  })
  const avgMoves = movesSorted.reduce((obj, moveName) => {
    obj[moveName] = movesTotal[moveName] / defenders.length
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

  const avgTTL = defenders.reduce((n, x) => n + x.best.ttl, 0) / defenders.length

  return {
    name: fmtName1,
    avgDPS: avgMoves[movesSorted[0]],
    avgTTL,
    avgMoves,
    bestAgainst: defenders.filter(x => x.best.ttl > GOOD_VS_THRESHOLD).reduce((obj, x) => {
      obj[x.vs] = x.best
      return obj
    }, {}),
    moveComboUsefulness,
    breakdown: defenders.reduce((obj, x) => {
      obj[x.vs] = x.best
      return obj
    }, {}),
  }
}

module.exports = analyzeBattleEffectiveness

/*
console.log(
  analyzeBattleEffectiveness('vaporeon', { IndAtk: 10, IndDef: 10, IndSta: 10 }, 25)
)
*/
