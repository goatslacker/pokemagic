const Pokemon = require('../json/pokemon.json')
const ovRating = require('./ovRating')
const avgComboDPS = require('./avgComboDPS')

const PokeMoves = Pokemon.reduce((pokes, poke) => Object.assign(pokes, {
  [poke.name]: poke.moves1.reduce((obj, move1) => (
    poke.moves2.reduce((o, move2) => {
      const info = avgComboDPS(poke, move1, move2)
      o[info.quick.name] = info.quick
      o[info.charge.name] = info.charge
      o[info.combo.name] = Object.assign({ meta: info.meta }, info.combo)
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
    .filter(x => x.meta)
    .map(x => f(x))
    .map(Math.log)
  )
)

const min = (poke, n, f) => Math.min.apply(
  Math.min,
  [n].concat(
    Object.keys(PokeMoves[poke])
    .map(x => PokeMoves[poke][x])
    .filter(x => x.meta)
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
    max: max(poke, best.def.max, x => x.gymDPS),
    min: min(poke, best.def.min, x => x.gymDPS),
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
// TODO weight ovAtk a bit more than statsRate.atk
const superAtkOverallRating = (statsRate, dps) => statsRate.atk + ovAtk(dps)
// TODO superDefOverallRating should take into account dodgeability of a move.
// TODO heavily weight statsRate.def and nerf ovDef(dps)
const superDefOverallRating = (statsRate, dps) => statsRate.def + ovDef(dps)
const superOverallRating = (statsRate, dps1, dps2) => (
  statsRate.ovr +
  superAtkOverallRating(statsRate, dps1) +
  superDefOverallRating(statsRate, dps2)
)

const Fast = {}

const PokemonRatings = Object.keys(PokeMoves).map((name) => {
  const poke = PokeMoves[name]
  const moves = Object.keys(poke)
    .map(x => poke[x])
    .filter(x => x.meta)

  const atkMoves = moves.slice().sort((a, b) => a.dps > b.dps ? -1 : 1)
  const defMoves = moves.slice().sort((a, b) => a.gymDPS > b.gymDPS ? -1 : 1)

  const atkBestMove = atkMoves.shift()
  const defBestMove = defMoves.shift()

  const pokemon = Pokemon.filter(x => x.name === name)[0]
  const statsRate = ovRating(pokemon)

  Fast[pokemon.name] = {
    name: pokemon.name,

    raw: superOverallRating(statsRate, atkBestMove.dps, defBestMove.gymDPS),

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
      raw: superDefOverallRating(statsRate, defBestMove.gymDPS),
      moveRating: ovDef(defBestMove.gymDPS),
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

const makeScale = arr => (f) => {
  const x = getMaxMin(arr, f)
  const scale = (x.max - x.min) / 100
  return n => Math.round((n - x.min) / scale)
}
const makePercent = makeScale(PokemonRatings)

const percent = makePercent(x => x.raw)
const percentAtk = makePercent(x => x.atk.raw)
const percentDef = makePercent(x => x.def.raw)

PokemonRatings.forEach((poke) => {
  poke.rating = percent(poke.raw)
  poke.atk.offenseRating = percentAtk(poke.atk.raw)
  poke.def.defenseRating = percentDef(poke.def.raw)
})

const fix = n => Math.round(n * 100) / 100

const getRating = (pokemon, move1, move2) => {
  const statsRate = ovRating(pokemon)

  const comboName = `${move1.Name}/${move2.Name}`
  const comboMove = PokeMoves[pokemon.name][comboName]

  const poke = {
    name: pokemon.name,

    raw: superOverallRating(statsRate, comboMove.dps, comboMove.gymDPS),

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
      raw: superDefOverallRating(statsRate, comboMove.gymDPS),
      moveRating: ovDef(comboMove.gymDPS),
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

//console.log(Fast.CATERPIE)
//console.log('vs')
//console.log(Fast.VAPOREON)
