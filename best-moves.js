const Pokemon = require('./pokemon.json')

// I'm guessing that you'll earn/spend ~200 energy per battle.
const MAGICAL_NUMBER = 200

// I'm trying to calculate what the total DPS is for a move throughout a battle
// AKA: how fast does the move get you to 200 Energy and how much DPS does it
// do over that amount of time.
// TODO is this true?
function totalBattleDPS(move) {
  return Math.abs(MAGICAL_NUMBER / move.Energy) * move.DPS
}

function bestMovesFor(pokemonName) {
  const fmtName = pokemonName.toUpperCase()
  const mon = Pokemon.filter(x => x.name === fmtName)[0]

  if (!mon) throw new Error(`Cannot find ${fmtName}`)

  const bestMove1 = mon.moves1.reduce((best, move) => {
    if (!best) return move
    return totalBattleDPS(best) > totalBattleDPS(move) ? best : move
  }, null)

  const bestMove2 = mon.moves2.reduce((best, move) => {
    if (!best) return move
    return totalBattleDPS(best) > totalBattleDPS(move) ? best : move
  }, null)

  return { bestMove1, bestMove2 }
}

console.log(
  bestMovesFor('arcanine')
)
