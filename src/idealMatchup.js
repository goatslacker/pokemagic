const Pokemon = require('../json/pokemon.json')
const dpsvs = require('./dpsvs')

const LegendaryPokemon = {
  ARTICUNO: 1,
  MEW: 1,
  MEWTWO: 1,
  MOLTRES: 1,
  ZAPDOS: 1,
}

function isNotLegendary(pokemon) {
  return !LegendaryPokemon.hasOwnProperty(pokemon.name || pokemon)
}

function bestPokemonVs(opponentName) {
  const opponent = Pokemon.filter(x => x.name === opponentName.toUpperCase())[0]
  return (
    Pokemon.reduce((arr, mon) => {
      // We can assume that your Pokemon will have an IndAtk of 10, because it's not shitty
      // and that your Pokemon's level is 20, because you just hatched it from an egg duh!
      const moves = dpsvs(mon, opponent, 10, 20)

      moves.forEach(move => arr.push({
        name: mon.name,
        score: move.netDPS,
        quick: move.quick,
        charge: move.charge,
      }))
      return arr
    }, [])
    .filter(isNotLegendary)
    .sort((a, b) => {
      return a.score > b.score ? -1 : 1
    })
    .slice(0, 15)
  )
}

module.exports = bestPokemonVs

// console.log(bestPokemonVs(process.argv[2] || 'dragonite'))
