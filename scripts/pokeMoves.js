const Pokemon = require('../json/pokemon')
const avgComboDPS = require('../src/avgComboDPS')

const PokeMoves = Pokemon.reduce((pokes, poke) => {
  pokes[poke.name] = poke.moves1.reduce((obj, move1) => {
    return poke.moves2.reduce((o, move2) => {
      const info = avgComboDPS(poke, move1, move2)
      o[info.quick.name] = info.quick
      o[info.charge.name] = info.charge
//      o[info.combo.name] = Object.assign({ meta: info.meta }, info.combo)
      o[info.combo.name] = info.combo
      return o
    }, obj)
  }, {})
  return pokes
}, {})

console.log(JSON.stringify(PokeMoves))
