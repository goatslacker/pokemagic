const analyzeBattleEffectiveness = require('./analyzeBattleEffectiveness')

// Figures out the best attacking combination of moves taking into account energy gain and STAB
// It uses 'analyzeBattleEffectiveness' which takes the top 20 Pokemon and runs a battle sim
// against them and sees how well ${pokemonName} scores vs them in terms of pure DPS
function bestMovesFor(pokemonName) {
  const analysis = analyzeBattleEffectiveness({
    name: pokemonName,
    level: 20,
    IndAtk: 10,
    IndDef: 10,
    IndSta: 10,
  })
  return Object.keys(analysis.avgMoves).reduce((arr, move) => {
    const split = move.split('/')

    return arr.concat({
      combo: move,
      quick: {
        name: split[0],
      },
      charge: {
        name: split[1],
      },
      dps: analysis.avgMoves[move],
    })
  }, [])
}

module.exports = bestMovesFor

// console.log(bestMovesFor('arcanine'))
