const Pokemon = require('../json/pokemon')

const addTMCombinations = poke => {
  const quick = {}
  const charge = {}
  const combos = {}
  poke.moves.combo.forEach(move => {
    quick[move.A] = 1
    charge[move.B] = 1
    combos[move.A + move.B] = 1
  })

  const currentQuick = poke.moves.quick
  const currentCharge = poke.moves.charge

  const keysQuick = Object.keys(quick)
  const keysCharge = Object.keys(charge)

  const prevQuick = keysQuick.filter(x => !currentQuick.includes(x))
  const prevCharge = keysCharge.filter(x => !currentCharge.includes(x))

  const newCombo = []
  currentQuick.forEach(A => {
    prevCharge.forEach(B => {
      if (!combos[A + B]) newCombo.push({ A, B })
    })
  })

  currentCharge.forEach(B => {
    prevQuick.forEach(A => {
      if (!combos[A + B]) newCombo.push({ A, B })
    })
  })

  return newCombo.map(x => Object.assign(x, { tm: true })).concat(poke.moves.combo)

  return {
    currentQuick,
    currentCharge,
    prevQuick,
    prevCharge,
  }
}

module.exports = addTMCombinations

// const moves = Pokemon.map(addTMCombinations)
// console.log(moves[148])
