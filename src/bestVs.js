const Pokemon = require('../json/pokemon.json')
const comboDPS = require('./comboDPS')
const LevelToCPM = require('../json/level-to-cpm.json')
const hp = require('./hp')
const addTMCombinations = require('./addTMCombinations')

const N_LVL = 30
const N_IV = 15

// This module figures out which Pokemon are best vs a particular opponent.
// API
//
// bestVs = Pokemon => BestList
//
// BestList = [BestPokemon]
//
// BestPokemon = {
//   ...Move,
//   rest: [Move]
// }
//
// Move = {
//   name: String,
//   quickMove; String,
//   chargeMove: String,
//   dps: Number,
//   ttl: Number,
//   score: Number,
// }

const ECpM = LevelToCPM[N_LVL]

const fix2 = n => Math.round(n * 100) / 100

// What the opponen's avg gym DPS is vs you
const avgGymDPS = (opp, you, gymDPS) => {
  const moves = addTMCombinations(opp)

  return moves.reduce((n, x) => {
    const move1 = x.A
    const move2 = x.B
    return n + comboDPS(opp, you, N_IV, N_IV, N_LVL, N_LVL, move1, move2).combo.gymDPS
  }, 0) / moves.length
}

const willTimeout = (dps, oppHP) => dps * 60 <= oppHP

const scoreDPS = (x, oppHP) => (
  ((x.dps * 2) + (x.ttl * 0.4)) *
  // If we're going to timeout then the score should be 0 for this move
  (willTimeout(x.dps, oppHP) ? 0 : 1)
)

const avgScoreMove = (arr, oppHP) => (
  arr.reduce((acc, x) => acc + scoreDPS(x, oppHP), 0) / arr.length
)

const scoreAllMoves = (you, opp, oppGymDPS) => avgScoreMove(
  getBestComboMoves(you, opp, oppGymDPS),
  hp.getHP(opp, N_IV, ECpM) * 2
)

// Get your best combo moves vs Opp sorted by DPS
const getComboMovesSortedByDPS = (you, opp) => {
  const moves = addTMCombinations(you)

  return moves.reduce((arr, x) => {
    const move1 = x.A
    const move2 = x.B
    return arr.concat(comboDPS(you, opp, N_IV, N_IV, N_LVL, N_LVL, move1, move2))
  }, [])
  .sort((a, b) => a.combo.dps > b.combo.dps ? -1 : 1)
}

const getOpponentTTL = (opp, yourDPS) => (
  hp.getHP(opp, N_IV, ECpM) * 2 / yourDPS
)

const getYourTTL = (you, oppGymDPS) => (
  hp.getHP(you, N_IV, ECpM) / oppGymDPS
)

const getTTLDiff = (opp, you, yourDPS, oppGymDPS) => (
  // Timeouts get a NaN as TTL
  willTimeout(yourDPS, hp.getHP(opp, N_IV, ECpM) * 2) ? NaN :
  getYourTTL(you, oppGymDPS) - getOpponentTTL(opp, yourDPS)
)

const addExtraMoves = arr => (
  arr.length > 0 ? Object.assign({}, arr[0], { rest: arr.slice(1) }) :
  null
)

const Legendaries = {
  ARTICUNO: 1,
  CELEBI: 1,
  DITTO: 1,
  ENTEI: 1,
  HO_OH: 1,
  LUGIA: 1,
  MEW: 1,
  MEWTWO: 1,
  MOLTRES: 1,
  RAIKOU: 1,
  SUICUNE: 1,
  ZAPDOS: 1,
}

const filterLegendaries = x => !Legendaries.hasOwnProperty(x.name.toUpperCase())

const ucFirst = x => x[0].toUpperCase() + x.slice(1).toLowerCase()

const fixMoveName = moveName => (
  moveName
    .replace('_FAST', '')
    .toLowerCase()
    .split('_')
    .map(ucFirst)
    .join(' ')
)

const schemaComboMove = (you, moves) => ({
  name: ucFirst(you.name),
  quickMove: fixMoveName(moves.quick.name),
  chargeMove: fixMoveName(moves.charge.name),
  dps: fix2(moves.combo.dps),
  ttl: fix2(moves.ttl),
  retired: moves.quick.retired === true || moves.charge.retired === true,
})

// Get your best moves combo moves with TTL and filtering out bad movesets
const getBestComboMoves = (you, opp, oppGymDPS) => (
  getComboMovesSortedByDPS(you, opp)
  .map(x => Object.assign(x, {
    ttl: getTTLDiff(opp, you, x.combo.dps, oppGymDPS),
  }))
  .map(x => schemaComboMove(you, x))
  // filter out any moves that will time you out
  .filter(x => !willTimeout(x.dps, hp.getHP(opp, N_IV, ECpM) * 2))
)

const bestVs = opp => (
  Pokemon.map(you => ({
    poke: addExtraMoves(
      getBestComboMoves(
        you,
        opp,
        avgGymDPS(opp, you)
      )
    ),
    score: fix2(
      scoreAllMoves(
        you,
        opp,
        avgGymDPS(opp, you)
      )
    ),
  }))
  .filter(x => Boolean(x.poke))
  .map(x => Object.assign(x.poke, { score: x.score }))
  .filter(filterLegendaries)
  .sort((a, b) => a.dps > b.dps ? -1 : 1)
)

module.exports = bestVs

console.log(bestVs(
 Pokemon.filter(x => x.name === 'DRAGONITE')[0]
).map(x => ({ p: x.name, q: x.quickMove, c: x.chargeMove, d: x.dps })))
