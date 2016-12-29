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

  // TODO make these dynamic
  const pokemonLevel = 1.5
  const opponentLevel = 1.5

  const AtkECpM = LevelToCPM[pokemonLevel]
  const DefECpM = LevelToCPM[opponentLevel]

  return moves.map((move) => {
    const stab = move.Type === player.type1 || move.Type === player.type2 ? 1.25 : 1
    const power = move.Power

    const fxMul = getTypeEffectiveness(opponent, move)

    return {
      poke: player,
      name: move.Name,
      duration: move.DurationMs,
      dmg: Math.floor((0.5 * atk * AtkECpM / (def * DefECpM) * power * stab * fxMul) + 1),
    }
  })
}

function hpFor(x) {
  return hpTools.getHP(x.pokemon, x.IndSta, LevelToCPM[x.level]) * 2
}

function createTrainer(pokemon) {
  return {
    pokemon,
    level: 1.5,
    IndAtk: 7,
    IndDef: 7,
    IndSta: 7,
  }
}

// TODO kill this function
// we need variable levels
function createGym(pokemon) {
  return {
    pokemon,
    level: 1.5,
    IndAtk: 7,
    IndDef: 7,
    IndSta: 7,
  }
}

function vFor(name) {
  const b = createGym(Pokemon.filter(x => x.name === name.toUpperCase())[0])
  const def = b.pokemon.stats.defense + b.IndDef
  const oppHp = hpFor(b)
  const oppCp = cpTools.getCP(b.pokemon, {
    atk: 7,
    def: 7,
    sta: 7,
  }, LevelToCPM[1.5])

  return b.pokemon.moves1.map(move => {
    return {
      bubbler: b.pokemon.name,
      move: move.Name,
      cp: oppCp,
      hp: oppHp,

      attackers: Pokemon
//      .filter(x => x.name === 'DIGLETT')
      .reduce((arr, trainer) => {
        const a = createTrainer(trainer)
        const atk = a.pokemon.stats.attack + a.IndAtk

        return arr.concat(getDmgVs({
          atk,
          def,
          player: a.pokemon,
          opponent: b.pokemon,
          moves: a.pokemon.moves1,
        }))
      }, [])
      // calculate total damage output for entire fight
      .map(x => {
        const howManyHits = Math.floor((move.DurationMs + 1000) / x.duration)
        return {
          name: x.poke.name,
          move: x.name,
          dmg: x.dmg * howManyHits,
          cp: cpTools.getCP(x.poke, {
            atk: 7,
            def: 7,
            sta: 7,
          }, LevelToCPM[1.5])
        }
      })
      // how many hits can you land before the opponent gets theirs off
      // Can we destroy the opponent before they land a hit...
      .filter(x => x.dmg >= oppHp)
      // calculate the prestige gain
      .map(x => ({
        n: x.name,
        m: x.move,
        cp: x.cp,
        prestige: oppCp > x.cp
          ? Math.min(1000, Math.floor(500 * (oppCp / x.cp)))
          : Math.min(100, Math.floor(310 * (oppCp / x.cp)) - 55),
      }))
      .filter(x => x.prestige >= 500)
      // sort by most prestige
      .sort((a, b) => a.prestige > b.prestige ? -1 : 1)
    }
  })
  .filter(x => x.attackers.length > 0)
}

//const DIGLETT = Pokemon.filter(x => x.name === 'DIGLETT')[0]
//const POLIWAG = Pokemon.filter(x => x.name === 'POLIWAG')[0]

//console.log('?',
//  getDmgVs({
//    atk: DIGLETT.stats.attack,
//    def: POLIWAG.stats.defense,
//    moves: [DIGLETT.moves1[2]],
//    player: DIGLETT,
//    opponent: POLIWAG,
//  }),
//  'hits', Math.floor((2300 + 1000) / 500),
//  6 * 4,
//  hpFor({ pokemon: POLIWAG, IndSta: 1, level: 1.5 })
//)

console.log(
//  vFor('poliwag')[0]
  vFor('horsea')[0]
)
