const Pokemon = require('../json/pokemon.json')
const LevelToCPM = require('../json/level-to-cpm.json')
const hp = require('./hp')

const BUG = 'BUG'
const DARK = 'DARK'
const DRAGON = 'DRAGON'
const ELECTRIC = 'ELECTRIC'
const FAIRY = 'FAIRY'
const FIGHTING = 'FIGHTING'
const FIRE = 'FIRE'
const FLYING = 'FLYING'
const GHOST = 'GHOST'
const GRASS = 'GRASS'
const GROUND = ' GROUND'
const ICE = 'ICE'
const NORMAL = 'NORMAL'
const POISON = 'POISON'
const PSYCHIC = 'PSYCHIC'
const ROCK = 'ROCK'
const STEEL = 'STEEL'
const WATER = 'WATER'

const SuperEffectiveTypes = {
  BUG: { FLYING, ROCK, FIRE },
  DARK: { FIGHTING, BUG, FAIRY },
  DRAGON: { ICE, DRAGON, FAIRY },
  ELECTRIC: { GROUND },
  FAIRY: { POISON, STEEL },
  FIGHTING: { FLYING, PSYCHIC, FAIRY },
  FIRE: { GROUND, ROCK, WATER },
  FLYING: { ROCK, ELECTRIC, ICE },
  GHOST: { GHOST, DARK },
  GRASS: { FLYING, POISON, BUG, FIRE, ICE },
  GROUND: { WATER, GRASS, ICE },
  ICE: { FIGHTING, ROCK, STEEL, FIRE },
  NORMAL: { FIGHTING },
  POISON: { GROUND, PSYCHIC },
  PSYCHIC: { BUG, GHOST, DARK },
  ROCK: { FIGHTING, GROUND, STEEL, WATER, GRASS },
  STEEL: { FIGHTING, GROUND, FIRE },
  WATER: { GRASS, ELECTRIC },
}

const ResistantTypes = {
  BUG: { FIGHTING, GROUND, GRASS },
  DARK: { GHOST, DARK },
  DRAGON: { FIRE, WATER, GRASS, ELECTRIC },
  ELECTRIC: { FLYING, STEEL, ELECTRIC },
  FAIRY: { FIGHTING, BUG, DARK }, // TODO verify this
  FIGHTING: { ROCK, BUG, DARK },
  FIRE: { BUG, STEEL, FIRE, GRASS, ICE, FAIRY },
  FLYING: { FIGHTING, BUG, GRASS },
  GHOST: { POISON, BUG },
  GRASS: { GROUND, WATER, GRASS, ELECTRIC },
  GROUND: { POISON, ROCK },
  ICE: { ICE },
  NORMAL: {},
  POISON: { FIGHTING, POISON, BUG, GRASS, FAIRY },
  PSYCHIC: { FIGHTING, PSYCHIC },
  ROCK: { NORMAL, FLYING, POISON, FIRE },
  STEEL: { NORMAL, FLYING, ROCK, BUG, STEEL, GRASS, PSYCHIC, ICE, DRAGON, FAIRY },
  WATER: { STEEL, FIRE, WATER, ICE },
}

const ImmuneTypes = {
  BUG: {},
  DARK: { PSYCHIC },
  DRAGON: {},
  ELECTRIC: {},
  FAIRY: { DRAGON },
  FIGHTING: {},
  FIRE: {},
  FLYING: { GROUND },
  GHOST: { NORMAL, FIGHTING },
  GRASS: {},
  GROUND: { ELECTRIC },
  ICE: {},
  NORMAL: { GHOST },
  POISON: {},
  PSYCHIC: {},
  ROCK: { ELECTRIC },
  STEEL: { POISON },
  WATER: {},
}


function getTypeEffectiveness(pokemon, move) {
  const s1 = SuperEffectiveTypes[pokemon.type1]
  const s2 = SuperEffectiveTypes[pokemon.type2]

  const r1 = ResistantTypes[pokemon.type1]
  const r2 = ResistantTypes[pokemon.type2]

  const i1 = ImmuneTypes[pokemon.type1]
  const i2 = ImmuneTypes[pokemon.type2]

  if (s1.hasOwnProperty(move.Type) && s2 && s2.hasOwnProperty(move.Type)) {
    return 1.56
  }

  if (s1.hasOwnProperty(move.Type) || (s2 && s2.hasOwnProperty(move.Type))) {
    return 1.25
  }

  if (r1.hasOwnProperty(move.Type) && r2 && r2.hasOwnProperty(move.Type)) {
    return 0.64
  }

  if (i1.hasOwnProperty(move.Type) && i2 && i2.hasOwnProperty(move.Type)) {
    return 0.64
  }

  if (r1.hasOwnProperty(move.Type) || (r2 && r2.hasOwnProperty(move.Type))) {
    return 0.8
  }

  if (i1.hasOwnProperty(move.Type) || (i2 && i2.hasOwnProperty(move.Type))) {
    return 0.8
  }

  return 1
}


function getDmgVs(obj) {
  const atk = obj.atk
  const def = obj.def
  const moves = obj.moves
  const player = obj.player
  const opponent = obj.opponent
  const pokemonLevel = obj.pokemonLevel || 25

  // We determine DPS combo vs a level 25 pokemon because that's what gyms on average will have.
  // There's no hard data for this claim btw, it's completely made up.
  const opponentLevel = obj.opponentLevel || 25

  const AtkECpM = LevelToCPM[pokemonLevel]
  const DefECpM = LevelToCPM[opponentLevel]

  return moves.map((move) => {
    const stab = move.Type === player.type1 || move.Type === player.type2 ? 1.25 : 1
    const power = move.Power

    const fxMul = getTypeEffectiveness(opponent, move)

    return (0.5 * atk * AtkECpM / (def * DefECpM) * power * stab * fxMul) + 1
  })
}

function getDPS(dmg, duration) {
  return (dmg / (duration / 1000)) || 0
}

function battleDPS(obj) {
  const atk = obj.atk
  const def = obj.def
  const level = obj.pokemonLevel
  const moves = obj.moves

  const quickHits = Math.ceil(100 / moves[0].Energy)
  const chargeHits = Math.abs(Math.ceil(100 / moves[1].Energy))

  const timeToQuick = quickHits * moves[0].DurationMs
  const timeToCharge = chargeHits * moves[1].DurationMs

  const dmg = getDmgVs(obj)

  const quickDmg = dmg[0] * quickHits
  const chargeDmg = dmg[1] * chargeHits

  const dps = getDPS(chargeDmg + quickDmg, timeToQuick + timeToCharge)

  return {
    dps,
    quickHits,
    chargeHits,
    quickDmg,
    chargeDmg,
  }
}

// IndAtk is the attacking pokemon's (mon) IV attack
// IndDef is the defeneding pokemon's (opponent) IV defense
function dpsvs(mon, opponent, IndAtk, IndDef, pokemonLevel, opponentLevel) {
  const moves = []
  const def = opponent.stats.defense + IndDef

  mon.moves1.forEach((move1) => {
    mon.moves2.forEach((move2) => {
      const atk = mon.stats.attack + IndAtk

      const total = battleDPS({
        atk,
        def,
        player: mon,
        opponent,
        pokemonLevel,
        opponentLevel,
        moves: [move1, move2],
      })

      moves.push({
        quick: move1.Name,
        charge: move2.Name,
        dps: total.dps,
      })
    })
  })

  return moves.sort((a, b) => a.dps > b.dps ? -1 : 1)
}

module.exports = dpsvs

/*
console.log(
  dpsvs(
    Pokemon.filter(x => x.name === 'VAPOREON')[0],
    Pokemon.filter(x => x.name === 'FLAREON')[0],
    10,
    10,
    25,
    25
  )
)
*/
