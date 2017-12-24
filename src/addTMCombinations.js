const Pokemon = require('../json/pokemon')
const Legacy = require('../json/legacy')

const FAST = /_FAST$/
function isFast(move) {
  return FAST.test(move)
}

const addTMCombinations = poke => {
  const comboMoves = []

  if (!poke) return comboMoves

  poke.moves.quick.forEach(quickMove => {
    poke.moves.charge.forEach(chargeMove => {
      comboMoves.push({
        A: quickMove,
        B: chargeMove,
      })
    })
  })

  const legacy = Legacy[poke.name]
  if (legacy) {
    // Add legacy combos
    legacy.forEach(legacyMove => {
      legacy.forEach(legacyMove2 => {
        if (legacyMove === legacyMove2) return

        if (isFast(legacyMove)) {
          comboMoves.push({
            A: legacyMove,
            B: legacyMove2,
            retired: true,
          })
        }
      })

      if (isFast(legacyMove)) {
        poke.moves.charge.forEach(chargeMove => {
          comboMoves.push({
            A: legacyMove,
            B: chargeMove,
            tm: true,
          })
        })
      } else {
        poke.moves.quick.forEach(quickMove => {
          comboMoves.push({
            A: quickMove,
            B: legacyMove,
            tm: true,
          })
        })
      }
    })
  }

  return comboMoves
}

module.exports = addTMCombinations
