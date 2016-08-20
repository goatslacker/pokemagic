const Pokemon = require('../json/pokemon.json')

const LegendaryPokemon = {
  ARTICUNO: 1,
  MEW: 1,
  MEWTWO: 1,
  MOLTRES: 1,
  ZAPDOS: 1,
}

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

function isNotLegendary(pokemon) {
  return !LegendaryPokemon.hasOwnProperty(pokemon.name || pokemon)
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

function getDmgVs(player, opponent, moves) {
  const atk = player.stats.attack
  const def = opponent.stats.defense

  return moves.map((move) => {
    const stab = move.Type === player.type1 || move.Type === player.type2 ? 1.25 : 1
    const power = move.Power

    const fxMul = getTypeEffectiveness(opponent, move)

    const ECpM = 0.790300
    return (0.5 * atk * ECpM / (def * ECpM ) * power * stab * fxMul) + 1
  })
}

function effectiveness(player, opponent) {
  const moves = []

  player.moves1.forEach((move1) => {
    player.moves2.forEach((move2) => {
      const dmg1 = getDmgVs(player, opponent, [move1, move2])

      const quickHits = Math.ceil(100 / move1.Energy)
      const chargeHits = Math.abs(Math.ceil(100 / move2.Energy))

      const timeToQuick = quickHits * move1.DurationMs
      const timeToCharge = chargeHits * move2.DurationMs

      const quickDmg = dmg1[0] * quickHits
      const chargeDmg = dmg1[1] * chargeHits

      const totalTime = timeToQuick + timeToCharge
      const dps = getDPS(chargeDmg + quickDmg, totalTime)

      moves.push({
        dps,
        quick: {
          name: move1.Name,
        },
        charge: {
          name: move2.Name,
        },
      })
    })
  })

  const bestMoves = moves.sort((a, b) => a.dps > b.dps ? -1 : 1)


  const oppMoves = []
  opponent.moves1.forEach((move1) => {
    opponent.moves2.forEach((move2) => {
      const dmg1 = getDmgVs(opponent, player, [move1, move2])

      const quickHits = Math.ceil(100 / move1.Energy)
      const chargeHits = Math.abs(Math.ceil(100 / move2.Energy))

      const timeToQuick = quickHits * move1.DurationMs
      const timeToCharge = chargeHits * move2.DurationMs

      const quickDmg = dmg1[0] * quickHits
      const chargeDmg = dmg1[1] * chargeHits

      const totalTime = timeToQuick + timeToCharge

      // Slow it down to 1.5 secs
      const dps = getDPS(chargeDmg + quickDmg, totalTime) * 0.75

      oppMoves.push({
        dps,
        quick: {
          name: move1.Name,
        },
        charge: {
          name: move2.Name,
        },
      })
    })
  })

  const bestMovesOpp = oppMoves.sort((a, b) => a.dps > b.dps ? -1 : 1)

  return bestMoves.map((x) => {
    return {
      playerDps: x.dps,
      opponentDps: bestMovesOpp[0].dps,
      score: x.dps - bestMovesOpp[0].dps,
      quick: x.quick,
      charge: x.charge,
    }
  }).sort((a, b) => a.score > b.score ? -1 : 1)
}


function getDPS(dmg, duration) {
  return Number((dmg / (duration / 1000)).toFixed(2)) || 0
}

function bestPokemonVs(opponentName) {
  const opponent = Pokemon.filter(x => x.name === opponentName.toUpperCase())[0]
  return (
    Pokemon.reduce((arr, mon) => {
      const moves = effectiveness(mon, opponent)
      moves.forEach(move => arr.push({
        name: mon.name,
        score: move.score,
        quick: move.quick.name,
        charge: move.charge.name,
      }))
      return arr
    }, [])
    .filter(isNotLegendary)
    .sort((a, b) => {
      return a.score > b.score ? -1 : 1
    })
    .slice(0, 15)
  )
}

module.exports = bestPokemonVs

//console.log(bestPokemonVs(process.argv[2] || 'arcanine'))

//const Arcanine = Pokemon.filter(x => x.name === 'ARCANINE')[0]
//const Vaporeon = Pokemon.filter(x => x.name === 'VAPOREON')[0]

//console.log(
//  JSON.stringify(effectiveness(Vaporeon, Arcanine))
//)
