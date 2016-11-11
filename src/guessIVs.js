'use strict'

const Pokemon = require('../json/pokemon.json')
const LevelToCPM = require('../json/level-to-cpm.json')
const CPM = require('../json/cpm.json')
const DustToLevel = require('../json/dust-to-level')

const cpTools = require('./cp')
const hpTools = require('./hp')
const bestCP = require('./bestCP')
const powerupTools = require('./powerup')

const pokeRatings = require('./pokeRatings')
const ovRating = require('./ovRating')
const avgComboDPS = require('./avgComboDPS')

function getMaxLevel(trainerLevel) {
  return LevelToCPM[String((trainerLevel || 0) + 1.5)]
}

function percentInRange(num, min, max) {
  return ((num - min) * 100) / (max - min)
}

function calcIndSta(hp, BaseSta, ECpM) {
  return Array.from(Array(16))
    .map((_, i) => i)
    .filter(IndSta => hp === Math.floor(ECpM * (BaseSta + IndSta)))
}

// A formula that determines in which percentile you are for Atk + Def
function getAttackPercentage(IndAtk, IndDef) {
  return Math.round((IndAtk + IndDef) / 30 * 100)
}

const ucFirst = x => x[0].toUpperCase() + x.slice(1).toLowerCase()

function guessByLevel(data, mon, ECpM) {
  const name = ucFirst(mon.name)

  const BaseSta = mon.stats.stamina

  const Level = Object.keys(LevelToCPM).reduce((lvl, key) => {
    if (LevelToCPM[key] === ECpM) {
      return key
    }
    return lvl
  }, null)

  const IndStaValues = calcIndSta(data.hp, BaseSta, ECpM)

  const MaxLevel = Number(data.trainerLevel) + 1.5
  const MaxLevelCpM = getMaxLevel(data.trainerLevel)

  // If you max this data out, what CP/HP would it have given Perfect IVs
  const MaxedPossibleCP = cpTools.getMaxCPForLevel(mon, MaxLevelCpM)
  const MaxedPossibleHP = hpTools.getMaxHPForLevel(mon, MaxLevelCpM)

  // What is this Pokemon's Max/Min CP/HP for your current level given Perfect IVs
  const MaxLevelCP = cpTools.getMaxCPForLevel(mon, ECpM)
  const MinLevelCP = cpTools.getMinCPForLevel(mon, ECpM)
  const MaxLevelHP = hpTools.getMaxHPForLevel(mon, ECpM)
  const MinLevelHP = hpTools.getMinHPForLevel(mon, ECpM)

  // Where is your Pokemon in terms of the CP/HP scale
  const PercentHP = Math.round(percentInRange(data.hp, MinLevelHP, MaxLevelHP))
  const PercentCP = Math.round(percentInRange(data.cp, MinLevelCP, MaxLevelCP))

  const maxLevel = data.level || Math.max.apply(null, DustToLevel[data.stardust])

  // Brute force find the IVs.
  // For every possible IndSta we'll loop through IndAtk and IndDef until we
  // find CPs that match your Pokemon's CP. Those are possible matches and are
  // returned by this function.
  const possibleValues = []
  IndStaValues.forEach((IndSta) => {
    for (let IndAtk = 0; IndAtk <= 15; IndAtk += 1) {
      for (let IndDef = 0; IndDef <= 15; IndDef += 1) {
        const CP = cpTools.getCP(mon, {
          atk: IndAtk,
          def: IndDef,
          sta: IndSta,
        }, ECpM)
        const HP = data.hp

        const BaseAtk = mon.stats.attack
        const Atk = (BaseAtk + IndAtk) * ECpM

        const BaseDef = mon.stats.defense
        const Def = (BaseDef + IndDef) * ECpM

        const BaseSta = mon.stats.stamina
        const Sta = (BaseSta + IndSta) * ECpM

        // The maximum CP and HP potential this Pokemon has
        const MaxCP = cpTools.getCP(mon, {
          atk: IndAtk,
          def: IndDef,
          sta: IndSta,
        }, MaxLevelCpM)
        const MaxHP = hpTools.getHP(mon, IndSta, MaxLevelCpM)

        const PerfectIV = Math.round((IndAtk + IndDef + IndSta) / 45 * 100)
        const PercentBatt = getAttackPercentage(IndAtk, IndDef)

        var EvolveCP = null
        var MaxEvolveCP = null

        if (data.cp === CP) {
          const typeRating = [
            mon.type1,
            mon.type2,
          ].filter(Boolean).reduce((obj, type) => Object.assign({
            [type]: bestCP.getCPRangeForType(type, Level, CP).value,
          }, obj), {})

          const levelTable = Array.from(Array(81 - Level * 2)).map((_, lvl) => {
            const level = Number(Level) + (lvl / 2)
            const ECpM = LevelToCPM[String(level)]

            const powerup = powerupTools.howMuchPowerUp(Level, level)
            const stardust = powerup.stardust
            const candy = powerup.candy

            const cp = cpTools.getCP(mon, {
              atk: IndAtk,
              def: IndDef,
              sta: IndSta,
            }, ECpM)

            const hp = hpTools.getHP(mon, IndSta, ECpM)

            return { level, cp, hp, stardust, candy }
          })

          possibleValues.push({
            id: mon.id,
            name,
            level: Level,
            cp: CP,
            hp: HP,

            types: [mon.type1, mon.type2].filter(Boolean).map(x => x.toLowerCase()),

            stats: {
              atk: mon.stats.attack,
              def: mon.stats.defense,
              sta: mon.stats.stamina,
            },

            ivs: {
              atk: IndAtk,
              def: IndDef,
              sta: IndSta,
            },

            candy: mon.candy,

            moves: mon.moves1.reduce((arr, move1) => (
              mon.moves2.reduce((acc, move2) => (
                arr.concat(Object.assign({
                  rating: pokeRatings.getRating(mon, move1.Name, move2.Name),
                }, avgComboDPS(mon, move1, move2, IndAtk, Level)))
              ), arr)
            ), []),

            // TODO clean up some of this CP shit
            evolutions: Pokemon.filter(x => x.family === mon.family && x.name !== mon.name).map((poke) => ({
              name: poke.name,
              cp: cpTools.getCP(poke, {
                atk: IndAtk,
                def: IndDef,
                sta: IndSta,
              }, ECpM),
              hp: hpTools.getHP(poke, IndSta, ECpM),
              range: {
                pokemon: Math.round((IndAtk + IndDef + IndSta) / 45 * 100),
                overall: bestCP.getCPRangeOverall(Level,
                  cpTools.getCP(poke, {
                    atk: IndAtk,
                    def: IndDef,
                    sta: IndSta,
                  }, ECpM)
                ).value,
              },
              rating: ovRating(poke),
            })),

            range: {
              pokemon: Math.round((IndAtk + IndDef + IndSta) / 45 * 100),
              overall: bestCP.getCPRangeOverall(Level, CP).value,
              type: typeRating,
            },

            rating: ovRating(mon),

            levels: levelTable,
          })
        }
      }
    }
  })

  return possibleValues
}

const guessIVs = (query, mon) => (
  DustToLevel[query.stardust].reduce((arr, level) => {
    const ECpM = LevelToCPM[String(level)]
    return arr.concat(guessByLevel(query, mon, ECpM))
  }, [])
)

module.exports = guessIVs

//console.log(
//  guessIVs(
//    { cp: 1019, hp: 87, stardust: 5000 },
//    Pokemon.filter(x => x.name === 'GROWLITHE')[0]
//  )[0]
//)
