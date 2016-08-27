const Pokemon = require('../json/pokemon.json')
const ttlvs = require('./ttlvs')

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

function lowerIsBetter(a, b) {
  return a.score > b.score ? 1 : -1
}

function higherIsBetter(a, b) {
  return a.score > b.score ? -1 : 1
}

// Answers the question of which is the best pokemon to go up against ${opponentName}
const idealMatchup = {
  // Gives you back a score in terms of how long (in sec) until you defeat the
  // opponent. Lower is better
  attacking(opponentName) {
    const opponent = Pokemon.filter(x => x.name === opponentName.toUpperCase())[0]
    return (
      Pokemon.reduce((arr, mon) => {
        // We can assume that your Pokemon will have an IndAtk of 10, because it's not shitty
        // and that your Pokemon's level is 20, because you just hatched it from an egg duh!
        const moves = ttlvs(mon, opponent, { IndAtk: 10, IndDef: 10, IndSta: 10 }, 25)

        moves.forEach(move => arr.push({
          name: mon.name,
          score: move.ttl.opponent,
          net: move.scores.netTTL,
          ttl: move.ttl.opponent,
          quick: move.quick,
          charge: move.charge,
        }))
        return arr
      }, [])
      .filter(isNotLegendary)
      .sort(lowerIsBetter)
      .slice(0, 10)
    )
  },

  // Gives you back a score in terms of TTL (time left to live for your Pokemon) higher TTL is better
  overall(opponentName) {
    const opponent = Pokemon.filter(x => x.name === opponentName.toUpperCase())[0]
    return (
      Pokemon.reduce((arr, mon) => {
        // We can assume that your Pokemon will have an IndAtk of 10, because it's not shitty
        // and that your Pokemon's level is 20, because you just hatched it from an egg duh!
        const moves = ttlvs(mon, opponent, { IndAtk: 10, IndDef: 10, IndSta: 10 }, 25)

        moves.forEach(move => arr.push({
          name: mon.name,
          score: move.scores.netTTL,
          net: move.scores.netTTL,
          ttl: move.ttl.opponent,
          quick: move.quick,
          charge: move.charge,
        }))
        return arr
      }, [])
      .filter(isNotLegendary)
      .sort(higherIsBetter)
      .slice(0, 10)
    )
  },
}

module.exports = idealMatchup

//console.log(idealMatchup.attacking(process.argv[2] || 'dragonite'))
