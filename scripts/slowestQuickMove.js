const Moves = require('../json/moves')

const slow = Object.keys(Moves).sort((id1, id2) => {
  const move1 = Moves[id1]
  const move2 = Moves[id2]

  return move1.DurationMs > move2.DurationMs ? 1 : -1
}).map(id => Moves[id]).filter(x => /_FAST/.test(x.Name))

console.log(slow.slice(0, 15))
