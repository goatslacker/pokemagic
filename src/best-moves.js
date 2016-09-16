const Pokemon = require('../json/pokemon')
const analyzeBattleEffectiveness = require('./analyzeBattleEffectiveness')

// Figures out the best attacking combination of moves taking into account energy gain and STAB
// It uses 'analyzeBattleEffectiveness' which takes the top 20 Pokemon and runs a battle sim
// against them and sees how well ${pokemonName} scores vs them in terms of pure DPS
function bestMovesFor(pokemonName, pokemonLevel, IndAtk, IndDef, IndSta) {
  const analysis = analyzeBattleEffectiveness({
    name: pokemonName,
    level: pokemonLevel || 25,
    IndAtk: IndAtk || 10,
    IndDef: IndDef || 10,
    IndSta: IndSta || 10,
  })

  const best = analyzeBattleEffectiveness({
    name: 'mewtwo',
    level: pokemonLevel || 25,
    IndAtk: IndAtk || 10,
    IndDef: IndDef || 10,
    IndSta: IndSta || 10,
  })

  const bestDPS = best.bestAvgDPS
  const bestTTL = best.bestAvgTTL

  const mon = Pokemon.filter(x => x.name === pokemonName.toUpperCase())[0]

  return Object.keys(analysis.avgMoves).reduce((arr, move) => {
    const split = move.split('/')

    const moves = split.map(name => (
      mon.moves1.filter(m => m.Name === name)[0] ||
      mon.moves2.filter(m => m.Name === name)[0]
    ))

    return arr.concat({
      combo: move,
      quick: {
        name: split[0],
        type: moves[0].Type,
      },
      charge: {
        name: split[1],
        type: moves[1].Type,
      },
      dps: analysis.avgMoves[move],
      ttl: analysis.avgTTL[move],
      percent: {
        dps: Math.floor(analysis.avgMoves[move] / bestDPS * 100),
        ttl: Math.floor(analysis.avgTTL[move] / bestTTL * 100),
      },
      retired: !moves.every(m => !m.retired)
    })
  }, [])
}

module.exports = bestMovesFor

//console.log(bestMovesFor('mewtwo', 26))
