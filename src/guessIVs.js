'use strict'

const Pokemon = require('../json/pokemon.json')
const LevelToCPM = require('../json/level-to-cpm.json')
const CPM = require('../json/cpm.json')
const DustToLevel = require('../json/dust-to-level')

const cpTools = require('./cp')
const hpTools = require('./hp')
const powerupTools = require('./powerup')

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

function guessIVs(pokemon, mon, ECpM) {
  const Name = pokemon.name.toUpperCase()

  const BaseSta = mon.stats.stamina

  const Level = Object.keys(LevelToCPM).reduce((lvl, key) => {
    if (LevelToCPM[key] === ECpM) {
      return key
    }
    return lvl
  }, null)

  const IndStaValues = calcIndSta(pokemon.hp, BaseSta, ECpM)

  const MaxLevel = Number(pokemon.trainerLevel) + 1.5
  const MaxLevelCpM = getMaxLevel(pokemon.trainerLevel)

  // If you max this pokemon out, what CP/HP would it have given Perfect IVs
  const MaxedPossibleCP = cpTools.getMaxCPForLevel(mon, MaxLevelCpM)
  const MaxedPossibleHP = hpTools.getMaxHPForLevel(mon, MaxLevelCpM)

  // What is this Pokemon's Max/Min CP/HP for your current level given Perfect IVs
  const MaxLevelCP = cpTools.getMaxCPForLevel(mon, ECpM)
  const MinLevelCP = cpTools.getMinCPForLevel(mon, ECpM)
  const MaxLevelHP = hpTools.getMaxHPForLevel(mon, ECpM)
  const MinLevelHP = hpTools.getMinHPForLevel(mon, ECpM)

  // Where is your Pokemon in terms of the CP/HP scale
  const PercentHP = Math.round(percentInRange(pokemon.hp, MinLevelHP, MaxLevelHP))
  const PercentCP = Math.round(percentInRange(pokemon.cp, MinLevelCP, MaxLevelCP))

  const maxLevel = pokemon.level || Math.max.apply(null, DustToLevel[pokemon.stardust])

  // How much powerup does it cost
  const powerup = powerupTools.howMuchPowerUp(maxLevel, pokemon.trainerLevel)
  const Stardust = powerup.stardust
  const Candy = powerup.candy

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
        const HP = pokemon.hp

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

        // If we can evolve it, what would it evolve to and what does it power up to?
        // TODO if flareon, jolteon, vaporeon...
        if (CPM[pokemon.name.toUpperCase()]) {
          EvolveCP = Math.floor(CPM[pokemon.name.toUpperCase()][1] * CP / 100) * 100
          MaxEvolveCP = Math.floor(CPM[pokemon.name.toUpperCase()][1] * MaxCP / 100) * 100
        }

        if (pokemon.cp === CP) {
          possibleValues.push({
            Name,
            Level,
            CP,
            HP,
            Atk,
            Def,
            Sta,
            ECpM,
            ivs: {
              IndAtk,
              IndDef,
              IndSta,
            },
            strings: {
              iv: `${IndAtk}/${IndDef}/${IndSta}`,
              batt: `${IndAtk + IndDef}/30`,
              maxcp: `${MaxCP}/${MaxedPossibleCP}`,
              maxhp: `${MaxHP}/${MaxedPossibleHP}`,
            },
            percent: {
              PercentBatt,
              PercentCP,
              PercentHP,
              PerfectIV,
            },
            meta: {
              Stardust,
              Candy,
              EvolveCP,
              MaxEvolveCP,
              MinLevelCP,
              MaxLevelCP,
              MinLevelHP,
              MaxLevelHP,
              MaxCP,
              MaxHP,
              MaxLevel,
              MaxedPossibleCP,
              MaxedPossibleHP,
            },
          })
        }
      }
    }
  })

  return possibleValues
}

module.exports = guessIVs
