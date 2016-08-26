const Pokemon = require('../json/pokemon')
const analyzeBattleEffectiveness = require('../src/analyzeBattleEffectiveness')
const getBestMoves = require('../src/best-moves')

// Find the top Pokemon with an average DPS of 10 for their best possible moveset
console.log(
  Pokemon.reduce((arr, mon) => {
    const moves = getBestMoves(mon.name)
    const type = [mon.type1, mon.type2].filter(Boolean).join('/')
    arr.push({
      name: mon.name,
      type,
      moves: moves[0].combo,
      dps: moves[0].dps,
    })

    return arr
  }, [])
  .sort((a, b) => {
    // Highest DPS
    return a.dps > b.dps ? -1 : 1

    // Most versatile
    return Object.keys(a.goodAgainst).length > Object.keys(b.goodAgainst).length ? -1 : 1
  })
  .filter(x => x.dps > 10)
)
