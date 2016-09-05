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

  const mon = Pokemon.filter(x => x.name === pokemonName.toUpperCase())[0]

  // include more detailed analysis
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
      },
      charge: {
        name: split[1],
      },
      dps: analysis.avgMoves[move],
      ttl: analysis.avgTTL[move],
      retired: !moves.every(m => !m.retired)
    })
  }, [])
}

module.exports = bestMovesFor

//console.log(bestMovesFor('arcanine', 26))
