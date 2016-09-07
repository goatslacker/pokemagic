const Pokemon = require('../json/pokemon')
const getTypeEffectiveness = require('../src/getTypeEffectiveness').getTypeEffectiveness
const cpTools = require('../src/cp')
const hpTools = require('../src/hp')
const LevelToCPM = require('../json/level-to-cpm')

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

    return {
      name: move.Name,
      duration: move.DurationMs,
      dmg: (0.5 * atk * AtkECpM / (def * DefECpM) * power * stab * fxMul) + 1,
    }
  })
}

function cpFor(x) {
  return cpTools.getCP(x.pokemon, {
    atk: x.IndAtk,
    def: x.IndDef,
    sta: x.IndSta,
  }, LevelToCPM[x.level])
}

function hpFor(x) {
  return hpTools.getHP(x.pokemon, x.IndSta, LevelToCPM[x.level])
}

// TODO not bubblestrat but we can perhaps figure out a ranking for training up
// a gym while using the least possible potions or with minimal amount of dodging
// call it the bubblestrat lite
function vs(a, b) {
  const atk = a.pokemon.stats.attack + a.IndAtk
  const def = b.pokemon.stats.defense + b.IndDef

  const oppHp = hpFor(b)

  return b.pokemon.moves1.map(move => {
    return {
      gym: b.pokemon.name,
      vs: move.Name,
      moves: getDmgVs({
        atk,
        def,
        player: a.pokemon,
        opponent: b.pokemon,
        pokemonLevel: a.level,
        opponentLevel: b.level,
        moves: a.pokemon.moves1,
      })
      // how many hits can you land before the opponent gets theirs off
      .map(x => {
        const howManyHits = Math.floor(move.DurationMs / x.duration)
        return {
          trainer: a.pokemon.name,
          name: x.name,
          dmg: x.dmg * howManyHits,
        }
      })
      // Can we destroy the opponent before they land a hit...
      .filter(x => x.dmg > oppHp)
    }
  })
  // filter out unviable moves
  .filter(x => x.moves.length > 0)
}

function createTrainer(pokemon) {
  return {
    pokemon,
    level: 1,
    IndAtk: 15,
    IndDef: 15,
    IndSta: 15,
  }
}

function createGym(pokemon) {
  return {
    pokemon,
    // XXX also do different levels...
    level: 2,
    IndAtk: 1,
    IndDef: 1,
    IndSta: 1,
  }
}

function vFor(name) {
  const b = createGym(Pokemon.filter(x => x.name === name.toUpperCase())[0])
  return Pokemon.map(trainer => {
    const a = createTrainer(trainer)
    return vs(a, b)
  }).filter(x => x.length > 0)
}

// Specific to bubblestrat only.
const TRAINER = createTrainer(Pokemon.filter(x => x.name === 'DIGLETT')[0])
const GYM = createGym(Pokemon.filter(x => x.name === 'HORSEA')[0])

// All possible Pokemon
const all = Pokemon.map(trainer => {
  const a = createTrainer(trainer)
  return Pokemon.map(gym => {
    const b = createGym(gym)
    return vs(a, b)
  }).filter(x => x.length > 0)
}).filter(x => x.length > 0)

//console.log(JSON.stringify(vs(TRAINER, GYM)))
//console.log(JSON.stringify(all))

console.log(JSON.stringify(vFor('rattata')))
