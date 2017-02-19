const Pokemon = require('../json/pokemon')
const avgComboDPS = require('../src/avgComboDPS')

const moves = []
Pokemon.forEach(poke => {
  poke.moves.quick.forEach(move1 => {
    poke.moves.charge.forEach(move2 => {
      const info = avgComboDPS(poke, move1, move2)
      moves.push({
        poke: poke.name,
        move: info.combo.name,
        dps: info.combo.dps,
        gymDPS: info.combo.gymDPS,
      })
    })
  })
})

moves.sort((a, b) => a.dps > b.dps ? -1 : 1)

console.log(
  moves
    .slice(0, 30)
    .reduce((obj, x) => {
      if (!obj[x.poke]) obj[x.poke] = []
      obj[x.poke].push(x)
      return obj
    }, {})
)
