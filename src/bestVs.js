const Pokemon = require('../json/pokemon.json')
const comboDPS = require('./comboDPS')
const LevelToCPM = require('../json/level-to-cpm.json')
const hp = require('./hp')

const GOOD_DPS = 10
const ECpM = LevelToCPM['30']

const lift = (x, f) => f(x)

const avgGymDPS = (poke, mon) => (
  poke.moves1.reduce((acc, move1) => (
      poke.moves2.reduce((acc, move2) => (
        acc + comboDPS(poke, mon, 10, 10, 30, 30, move1, move2).combo.gymDPS
      ), acc)
  ), 0) / (poke.moves1.length * poke.moves2.length)
)

const avgDPS = (poke, mon) => (
  poke.moves1.reduce((acc, move1) => (
      poke.moves2.reduce((acc, move2) => (
        acc + comboDPS(poke, mon, 10, 10, 30, 30, move1, move2).combo.dps
      ), acc)
  ), 0) / (poke.moves1.length * poke.moves2.length)
)

const getComboMovesSortedByDPS = (poke, mon) => (
  mon.moves1.reduce((arr, move1) => {
    mon.moves2.forEach((move2) => {
      arr.push(comboDPS(mon, poke, 10, 10, 30, 30, move1, move2))
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

const getBestComboMoves = (poke, mon, gymDPS) => (
  getComboMovesSortedByDPS(poke, mon)
  .map(x => ({
    name: mon.name,
    moves: x.combo.name,
    dps: x.combo.dps,
    ttl: getTTLDiff(poke, mon, x.combo.dps, gymDPS),
  }))
  .filter(x => x.dps > GOOD_DPS || x.ttl > 0)
)

const bestVs = poke => (
  Pokemon.map(mon => ({
    poke: addExtraMoves(getBestComboMoves(poke, mon, avgGymDPS(poke, mon))),
    score: avgDPS(mon, poke),
  }))
  .filter(x => Boolean(x.poke))
  .map(x => Object.assign(x.poke, { score: x.score }))
  .sort((a, b) => a.score > b.score ? -1 : 1)
)

module.exports = bestVs

//console.log(bestVs(
//  Pokemon.filter(x => x.name === 'DRAGONITE')[0]
//))

