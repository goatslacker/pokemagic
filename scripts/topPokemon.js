const Pokemon = require('../json/pokemon')
const analyzeBattleEffectiveness = require('../src/analyzeBattleEffectiveness')

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

console.log(
  JSON.stringify(
  Pokemon.reduce((arr, mon) => {
    const effectiveness = analyzeBattleEffectiveness({
      name: mon.name,
      IndAtk: 10,
      IndDef: 10,
      IndSta: 10,
      level: 25,
    })
    const type = [mon.type1, mon.type2].filter(Boolean).join('/')

    const baseDPS = Math.floor(effectiveness.bestAvgDPS)

    arr.push({
      name: mon.name,
      type,
      moves: Object.keys(effectiveness.avgMoves).reduce((arr, moveName) => {
        if (effectiveness.avgMoves[moveName] > baseDPS) {
          return arr.concat({ moveName, dps: effectiveness.avgMoves[moveName] })
        }

        return arr
      }, []),
      dps: effectiveness.bestAvgDPS,
      ttl: effectiveness.bestAvgTTL,
    })

    return arr
  }, [])
  .filter(isNotLegendary)
  .sort((a, b) => {
    // Best TTL
    return a.ttl > b.ttl ? -1 : 1

    // Highest DPS
    return a.dps > b.dps ? -1 : 1

    // Most versatile
    return Object.keys(a.goodAgainst).length > Object.keys(b.goodAgainst).length ? -1 : 1
  })
  // group by best for type combo
//  .reduce((obj, mon) => {
//    if (!obj[mon.type]) obj[mon.type] = mon
//    return obj
//  }, {})
  .slice(0, 20)
  )
)
