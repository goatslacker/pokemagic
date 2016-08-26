const analyzeBattleEffectiveness = require('./analyzeBattleEffectiveness')

function bestMovesFor(pokemonName) {
  const analysis = analyzeBattleEffectiveness(pokemonName, 10, 20)
  return Object.keys(analysis.avgMoves).reduce((arr, move) => {
    return arr.concat({
      combo: move,
      dps: analysis.avgMoves[move],
    })
  }, [])
}

module.exports = bestMovesFor

/*
console.log(
  bestMovesFor('arcanine')
)
*/
