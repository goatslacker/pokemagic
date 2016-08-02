'use strict'

const Pokemon = require('./pokemon.json')
const Moves = require('./moves.json')
const LevelToCPM = require('./level-to-cpm.json')

// CP = (BaseAtk + IndAtk) * (BaseDef + IndDef)^0.5 * (BaseSta + IndSta)^0.5 * (ECpM)^2 / 10

const find = (obj, f) => Object.keys(obj).reduce((a, key) => {
  if (a) return a
  if (f(obj[key]) === true) return obj[key]
  return null
}, null)

function findPokemon(name) {
  const fmtName = name.toUpperCase()
  const mon = find(Pokemon, x => x.name === fmtName)

  return mon
}

// XXX this part is really important!
const DustToLevel = {
  2500: [19, 19.5, 20, 20.5],
  3000: [21, 21.5, 22, 22.5],
  3500: [23, 23.5, 24, 24.5],
  4000: [25, 25.5, 26, 26.5],
}

function stats() {
  // These come from our Pokemon database
  const BaseAtk = 126
  const BaseDef = 126
  const BaseSta = 90

  // I'm trying to find these values!
  const IndAtk = 13
  const IndDef = 13
  const IndSta = 14

  // This needs to be user provided, and it is very important!!!!
  const Level = 20

  const ECpM = LevelToCPM[String(Level)]

  const CP = Math.floor(
    (BaseAtk + IndAtk) *
    Math.pow((BaseDef + IndDef), 0.5) *
    Math.pow((BaseSta + IndSta), 0.5) *
    Math.pow(ECpM, 2) /
    10
  )
  const HP = Math.floor(ECpM * (BaseSta + IndSta))

  return { CP, HP }
}

function ivStaminaFromHP(hp) {
  const BaseSta = 90
  const Level = 20
  const ECpM = LevelToCPM[String(Level)]

  return Array.from(Array(15))
    .map((_, i) => i)
    .filter(IndSta => hp === Math.floor(ECpM * (BaseSta + IndSta)))
}

// This works OK except that I really can't tell attack and defense apart
// and sometimes they might have wildly different IVs
function ivAttackDefenseFromCP(cp, IndSta) {
  const BaseAtk = 126
  const BaseDef = 126
  const BaseSta = 90
  const Level = 20
  const ECpM = LevelToCPM[String(Level)]

  const possibleValues = []
  for (let IndAtk = 0; IndAtk < 15; IndAtk += 1) {
    for (let IndDef = 0; IndDef < 15; IndDef += 1) {
      const CP_RAW = (
        (BaseAtk + IndAtk) *
        Math.pow((BaseDef + IndDef), 0.5) *
        Math.pow((BaseSta + IndSta), 0.5) *
        Math.pow(ECpM, 2) /
        10
      )
      const CP = Math.floor(CP_RAW)
      const Total = IndAtk + IndDef

      const Perfect = Math.round((Total + IndSta) / 45 * 100)

      if (cp === CP) {
        possibleValues.push({
          IndAtk,
          IndDef,
          IndSta,
          Total,
          CP_RAW,
          Perfect
        })
      }
    }
  }

  return possibleValues
}

function calcIndSta(hp, BaseSta, ECpM) {
  return Array.from(Array(15))
    .map((_, i) => i)
    .filter(IndSta => hp === Math.floor(ECpM * (BaseSta + IndSta)))
}

function calculate(pokemonName, cp, hp, Level) {
  const mon = find(Pokemon, x => x.name === pokemonName.toUpperCase())

  const BaseAtk = mon.stats.attack
  const BaseDef = mon.stats.defense
  const BaseSta = mon.stats.stamina

  const ECpM = LevelToCPM[String(Level)]

  // TODO what if this has a length of more than 1, or a length or 0?
  const IndStaValues = calcIndSta(hp, BaseSta, ECpM)

  const possibleValues = []
  IndStaValues.forEach((IndSta) => {
    for (let IndAtk = 0; IndAtk < 15; IndAtk += 1) {
      for (let IndDef = 0; IndDef < 15; IndDef += 1) {
        const CP_RAW = (
          (BaseAtk + IndAtk) *
          Math.pow((BaseDef + IndDef), 0.5) *
          Math.pow((BaseSta + IndSta), 0.5) *
          Math.pow(ECpM, 2) /
          10
        )
        const CP = Math.floor(CP_RAW)
        const Total = IndAtk + IndDef

        const Perfect = Math.round((Total + IndSta) / 45 * 100)

        if (cp === CP) {
          possibleValues.push({
            pokemonName,
            IndAtk,
            IndDef,
            IndSta,
            Total,
            CP_RAW,
            Perfect,
          })
        }
      }
    }
  })

  return possibleValues
}

function calcIVS(pokemonName, hp, Level) {
  const mon = find(Pokemon, x => x.name === pokemonName.toUpperCase())

  const BaseAtk = mon.stats.attack
  const BaseDef = mon.stats.defense
  const BaseSta = mon.stats.stamina

  const ECpM = LevelToCPM[String(Level)]

  // XXX pretty sure they pop the value...
  return calcIndSta(hp, BaseSta, ECpM)
}

//console.log(ivStaminaFromHP(62))
//console.log(ivAttackDefenseFromCP(596, 14))

//console.log(findPokemon('bulbasaur'))

// Ok mostly works...
//console.log(calculate('bulbasaur', 596, 62, 20))
console.log(calculate('growlithe', 666, 65, 19))
//console.log(calcIVS('growlithe', 65, 19))
