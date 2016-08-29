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

function getEffectiveness(pokemon) {
  const s1 = Object.keys(SuperEffectiveTypes[pokemon.type1])
  const s2 = Object.keys(SuperEffectiveTypes[pokemon.type2] || {})

  const r1 = Object.keys(ResistantTypes[pokemon.type1])
  const r2 = Object.keys(ResistantTypes[pokemon.type2] || {})

  const i1 = Object.keys(ImmuneTypes[pokemon.type1])
  const i2 = Object.keys(ImmuneTypes[pokemon.type2] || {})

  return {
    superEffective: s1.concat(s2),
    notEffective: r1.concat(r2, i1, i2),
  }
}

module.exports = {
  getTypeEffectiveness,
  getEffectiveness,
}
