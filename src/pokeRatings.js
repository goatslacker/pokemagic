const Pokemon = require('../json/pokemon.json')
const ovRating = require('./ovRating')
const avgComboDPS = require('./avgComboDPS')

const scoreQuickMove = move => (
  (1 / Math.pow(Math.min(move.startTime, 2), 0.2)) *
  move.dmg
)

const scoreChargeMove = move => (
  (1 / Math.max(move.dodgeTime, 0.1)) *
  (1 / Math.pow(Math.max(move.startTime, 0.1), 0.5)) *
  Math.pow(move.dmg, 0.5)
)

const defScoreComboMove = (quickMove, chargeMove) => (
  scoreQuickMove(quickMove) + scoreChargeMove(chargeMove)
)

const Fast = {}

const PokeMoves = Pokemon.reduce((pokes, poke) => Object.assign(pokes, {
  [poke.name]: poke.moves.quick.reduce((obj, move1) => (
    poke.moves.charge.reduce((o, move2) => {
      const info = avgComboDPS(poke, move1, move2)
      o[info.quick.name] = info.quick
      o[info.charge.name] = info.charge
      o[info.combo.name] = Object.assign({}, info.combo, {
        quick: info.quick,
        charge: info.charge,
        combo: true,
        gymScore: defScoreComboMove(info.quick, info.charge),
      })
      return o
    }, obj)
  ), {}),
}), {})

// Used to calculate a move's "rating" from 0-100%
const max = (poke, n, f) => Math.max.apply(
  Math.max,
  [n].concat(
    Object.keys(PokeMoves[poke])
    .map(x => PokeMoves[poke][x])
    .filter(x => x.combo)
    .map(x => f(x))
    .map(Math.log)
  )
)

const min = (poke, n, f) => Math.min.apply(
  Math.min,
  [n].concat(
    Object.keys(PokeMoves[poke])
    .map(x => PokeMoves[poke][x])
    .filter(x => x.combo)
    .map(x => f(x))
    .map(Math.log)
  )
)

const PokeScale = Object.keys(PokeMoves).reduce((best, poke) => ({
  atk: {
    max: max(poke, best.atk.max, x => x.dps),
    min: min(poke, best.atk.min, x => x.dps),
  },
  def: {
    max: max(poke, best.def.max, x => x.gymScore),
    min: min(poke, best.def.min, x => x.gymScore),
  },
}), {
  atk: {
    max: -Infinity,
    min: Infinity,
  },
  def: {
    max: -Infinity,
    min: Infinity,
  },
})

const ATK_SCALE = (PokeScale.atk.max - PokeScale.atk.min) / 100
const DEF_SCALE = (PokeScale.def.max - PokeScale.def.min) / 100

// Overall rating of an Attacking move. n = move's dps
const ovAtk = n => Math.round((Math.log(n) - PokeScale.atk.min) / ATK_SCALE)

// Overall rating of a defending move. n = move's gymDPS
const ovDef = n => Math.round((Math.log(n) - PokeScale.def.min) / DEF_SCALE)

//console.log(ovAtk(7.814606351191717))
//console.log(ovDef(3.6762446471184336))

// Algo to calculate an "overall" rating for attacking, defending, and overall.
// The attacking one takes into account base stats weighed towards CP calc, the
// defending one is weighed towards stamina. We then add the ovAtk and ovDef
// ratings. A superOverallRating is NOT between 0-100. That function exists
// below.
const superAtkOverallRating = (statsRate, dps) => statsRate.atk + (ovAtk(dps) * 2)
const superDefOverallRating = (statsRate, gymScore) => {
  return (statsRate.def * 10) + (gymScore / 10)
}
const superOverallRating = (statsRate, dps1, gymScore) => (
  statsRate.ovr +
  superAtkOverallRating(statsRate, dps1) +
  superDefOverallRating(statsRate, gymScore)
)

const PokemonRatings = Object.keys(PokeMoves).map((name) => {
  const poke = PokeMoves[name]
  const moves = Object.keys(poke)
    .map(x => poke[x])
    .filter(x => x.combo)

  const pokemon = Pokemon.filter(x => x.name === name)[0]
  const statsRate = ovRating(pokemon)

  const atkMoves = moves.slice().sort((a, b) => a.dps > b.dps ? -1 : 1)
  const defMoves = moves.slice().sort((a, b) => (
    superDefOverallRating(statsRate, a.gymScore) > superDefOverallRating(statsRate, b.gymScore) ? -1 : 1)
  )

  const atkBestMove = atkMoves.shift()
  const defBestMove = defMoves.shift()

  Fast[pokemon.name] = {
    name: pokemon.name,

    raw: superOverallRating(statsRate, atkBestMove.dps, defBestMove.gymScore),

    statsRate,

    atk: {
      name: atkBestMove.name,
      dps: atkBestMove.dps,
      raw: superAtkOverallRating(statsRate, atkBestMove.dps),
      moveRating: ovAtk(atkBestMove.dps),
    },

    def: {
      name: defBestMove.name,
      gymDPS: defBestMove.gymDPS,
      raw: superDefOverallRating(statsRate, defBestMove.gymScore),
      moveRating: ovDef(defBestMove.gymScore),
    },
  }

  return Fast[pokemon.name]
}).sort((a, b) => a.raw > b.raw ? -1 : 1)

const getMaxMin = (arr, f) => arr.reduce((o, x) => {
  const n = f(x)
  return {
    max: Math.max(o.max, n),
    min: Math.min(o.min, n),
  }
}, {
  max: -Infinity,
  min: Infinity,
})

const makeScale = arr => (f, yy) => {
  const x = getMaxMin(arr, f)
  const scale = (x.max - x.min) / 100
  return n => Math.round((n - x.min) / scale)
}
const makePercent = makeScale(PokemonRatings)

const percent = makePercent(x => x.raw)
const percentAtk = makePercent(x => x.atk.raw)
const percentDef = makePercent(x => x.def.raw, 'rateMoves')

PokemonRatings.forEach((poke) => {
  poke.rating = percent(poke.raw)
  poke.atk.offenseRating = percentAtk(poke.atk.raw)
  poke.def.defenseRating = percentDef(poke.def.raw)
})

const fix = n => Math.round(n * 100) / 100

const getRating = (pokemon, move1, move2) => {
  const statsRate = ovRating(pokemon)

  const comboName = `${move1.name}/${move2.name}`
  const comboMove = PokeMoves[pokemon.name][comboName]

  const poke = {
    name: pokemon.name,

    raw: superOverallRating(statsRate, comboMove.dps, comboMove.gymScore),

    statsRate,

    atk: {
      name: comboMove.name,
      dps: fix(comboMove.dps),
      raw: superAtkOverallRating(statsRate, comboMove.dps),
      moveRating: ovAtk(comboMove.dps),
    },

    def: {
      name: comboMove.name,
      gymDPS: fix(comboMove.gymDPS),
      raw: superDefOverallRating(statsRate, comboMove.gymScore),
      moveRating: ovDef(comboMove.gymScore),
    },
  }

  poke.rating = percent(poke.raw)
  poke.atk.offenseRating = percentAtk(poke.atk.raw)
  poke.def.defenseRating = percentDef(poke.def.raw)

  return poke
}

module.exports = {
  PokemonRatings,
  PokemonMap: Fast,
  getRating,
}

//console.log(PokemonRatings.map((x => ({ name: x.name, ov: x.rating }))))

/*
console.log(1, 'Zen Headbutt/Hyper Beam', defScoreComboMove({
  dmg: 6.81,
  start: 0.85,
  dodge: 0.2,
}, {
  dmg: 73.74,
  start: 0.4,
  dodge: 0.8,
}))

console.log(1, 'Zen Headbutt/Body Slam', defScoreComboMove({
  dmg: 6.81,
  start: 0.85,
  dodge: 0.2,
}, {
  dmg: 24.93,
  start: 1.1,
  dodge: 0.2,
}))

console.log('HB', scoreMove({
  dmg: 73.74,
  start: 0.4,
  dodge: 0.8,
}))

console.log('BS', scoreMove({
  dmg: 24.93,
  start: 1.1,
  dodge: 0.2,
}))

console.log(2, 'Splash/Struggle', scoreMove({
  dmg: 1,
  start: 1.03,
  dodge: 0.2,
}, {
  dmg: 2.44,
  start: 0.8,
  dodge: 0.7,
}, 0.48))
*/

//console.log(getRating(
//  Pokemon.filter(x => x.name === 'SNORLAX')[0],
//  Pokemon.filter(x => x.name === 'SNORLAX')[0].moves.quick[0],
//  Pokemon.filter(x => x.name === 'SNORLAX')[0].moves.charge[0]
//))

//const rateMoves = poke => (
//  Object.keys(PokeMoves[poke])
//  .map(x => PokeMoves[poke][x])
//  .filter(x => x.combo)
//  .map(x => [poke, x.name, x.gymScore])
//)

//const all = Pokemon.reduce((arr, poke) => arr.concat(rateMoves(poke.name)), []).sort((a, b) => a[2] > b[2] ? -1 : 1)

//console.log(rateMoves('EXEGGUTOR'))

//console.log(all[0], all[all.length - 1])

//console.log(Fast.EXEGGUTOR)
//console.log('vs')
//console.log(Fast.DRAGONITE)
