const Pokemon = require('../json/pokemon')
const Moves = require('../json/moves')

const MovesObj = Moves.reduce((o, m) => {
  o[m.Name] = m.DamageWindowStartMs
  return o
}, {})

function quickMove(poke, move) {
  const stab = move.Type === poke.type1 || move.Type === poke.type2 ? 1.25 : 1
  // Favor power with a slight advantage to energy increasing moves, also stab
  return move.Power * (move.Energy * 0.25) * stab
}

function chargeMove(poke, move) {
  const stab = move.Type === poke.type1 || move.Type === poke.type2 ? 1.25 : 1
  // Favors lower energy moves, stab, and power, and a lower damage window start
  return Math.abs(move.Power * (100 / move.Energy) * (1500 / MovesObj[move.Name]) * stab)
}

function defensiveMoves(poke) {
  console.log('@', poke)
  const moves1 = poke.moves1.sort(
    (a, b) => quickMove(poke, a) > quickMove(poke, b) ? -1 : 1
  )

  const moves2 = poke.moves2.sort(
    (a, b) => chargeMove(poke, a) > chargeMove(poke, b) ? -1 : 1
  )

  return { moves1, moves2 }
}

module.exports = defensiveMoves

//console.log(
//  defensiveMoves(Pokemon.filter(x => x.name === 'VENUSAUR')[0])
//)
