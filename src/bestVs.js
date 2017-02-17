const Pokemon = require('../json/pokemon.json')
const comboDPS = require('./comboDPS')
const LevelToCPM = require('../json/level-to-cpm.json')
const hp = require('./hp')

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

const GOOD_DPS = 10
const ECpM = LevelToCPM['30']

const fix2 = n => Math.round(n * 100) / 100

// What the opponen's avg gym DPS is vs you
const avgGymDPS = (opp, you, gymDPS) => (
  opp.moves.quick.reduce((acc, move1) => (
    opp.moves.charge.reduce((n, move2) => (
      n + comboDPS(opp, you, 10, 10, 30, 30, move1, move2).combo.gymDPS
    ), acc)
  ), 0) / (opp.moves.quick.length * opp.moves.charge.length)
)

const scoreDPS = (x) => (
  (x.dps * 2) + (x.ttl * 0.4)
)

const avgScoreMove = arr => (
  arr.reduce((acc, x) => acc + scoreDPS(x), 0) / arr.length
)

const scoreAllMoves = (you, opp, oppGymDPS) => avgScoreMove(
  getBestComboMoves(you, opp, oppGymDPS)
)

// Get your best combo moves vs Opp sorted by DPS
const getComboMovesSortedByDPS = (you, opp) => (
  you.moves.quick.reduce((arr, move1) => {
    you.moves.charge.forEach((move2) => {
      arr.push(comboDPS(you, opp, 10, 10, 30, 30, move1, move2))
    })
    return arr
  }, [])
  .sort((a, b) => a.combo.dps > b.combo.dps ? -1 : 1)
)

const getOpponentTTL = (opp, yourDPS) => (
  hp.getHP(opp, 10, ECpM) * 2 / yourDPS
)

const getYourTTL = (you, oppGymDPS) => (
  hp.getHP(you, 10, ECpM) / oppGymDPS
)

const getTTLDiff = (opp, you, yourDPS, oppGymDPS) => (
  getYourTTL(you, oppGymDPS) - getOpponentTTL(opp, yourDPS)
)

const addExtraMoves = arr => (
  arr.length > 0 ? Object.assign({}, arr[0], { rest: arr.slice(1) }) :
  null
)

const Legendaries = {
  ARTICUNO: 1,
  DITTO: 1,
  MEW: 1,
  MEWTWO: 1,
  MOLTRES: 1,
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
  .filter(x => x.dps > GOOD_DPS || x.ttl > 0)
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
  .sort((a, b) => a.score > b.score ? -1 : 1)
)

module.exports = bestVs

//console.log(bestVs(
//  Pokemon.filter(x => x.name === 'ARCANINE')[0]
//).map(x => ({ name: x.name, q: x.quickMove })))
