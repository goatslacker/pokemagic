const analyzeBattleEffectiveness = require('./analyzeBattleEffectiveness')

// Figures out the best attacking combination of moves taking into account energy gain and STAB
// It uses 'analyzeBattleEffectiveness' which takes the top 20 Pokemon and runs a battle sim
// against them and sees how well ${pokemonName} scores vs them in terms of pure DPS
function bestMovesFor(pokemonName) {
  const analysis = analyzeBattleEffectiveness(pokemonName, {
    IndAtk: 10,
    IndDef: 10,
    IndSta: 10,
  }, 20)
  return Object.keys(analysis.avgMoves).reduce((arr, move) => {
    return arr.concat({
      combo: move,
      dps: analysis.avgMoves[move],
    })
  }, [])
}

module.exports = bestMovesFor

// console.log(bestMovesFor('arcanine'))
