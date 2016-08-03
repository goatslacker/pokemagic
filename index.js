'use strict'

const Pokemon = require('./pokemon.json')
const Moves = require('./moves.json')
const LevelToCPM = require('./level-to-cpm.json')

function findPokemon(name) {
  const fmtName = name.toUpperCase()

  return Object.keys(Pokemon).reduce((a, key) => {
    if (a) return a
    if (Pokemon[key].name === fmtName) return Pokemon[key]
    return null
  }, null)
}

const DustToLevel = {
  200: [1, 1.5, 2, 2.5],
  400: [3, 3.5, 4, 4.5],
  600: [5, 5.5, 6, 6.5],
  800: [7, 7.5, 8, 8.5],
  1000: [9, 9.5, 10, 10.5],
  1300: [11, 11.5, 12, 12.5],
  1600: [13, 13.5, 14, 14.5],
  1900: [15, 15.5, 16, 16.5],
  2200: [17, 17.5, 18, 18.5],
  2500: [19, 19.5, 20, 20.5],
  3000: [21, 21.5, 22, 22.5],
  3500: [23, 23.5, 24, 24.5],
  4000: [25, 25.5, 26, 26.5],
  4500: [27, 27.5, 28, 28.5],
  5000: [29, 29.5, 30, 30.5],
  6000: [31, 31.5, 32, 32.5],
  7000: [33, 33.5, 34, 34.5],
  8000: [35, 35.5, 36, 36.5],
  9000: [37, 37.5, 38, 38.5],
  10000: [39, 39.5, 40, 40.5],
}

// A good pokemon is in the 80th percentile for Atk, CP, HP, and IV.
// This 80th percentile thing was made up by me.
const isGoodPokemon = (
  v => v.percent.PercentAtk >= 80 &&
       v.percent.PercentCP >= 80 &&
       v.percent.PerfectIV >= 80 &&
       v.percent.PercentHP >= 80
)

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

// Formula to calculate the HP given the IV stamina and ECpM
function getHP(mon, IndSta, ECpM) {
  const BaseSta = mon.stats.stamina
  return Math.floor(ECpM * (BaseSta + IndSta))
}

// The minimum HP for a Pokemon that has perfect IVs
function getMaxHP(mon) {
  return getHP(mon, 15, 0.790300)
}

// The maximum HP for your Pokemon's current level
function getMaxHPForLevel(mon, ECpM) {
  return getHP(mon, 15, ECpM)
}

// The minimum HP for your Pokemon's current level
function getMinHPForLevel(mon, ECpM) {
  return getHP(mon, 0, ECpM)
}

// Formula to calculate the CP given the IVs and ECpM
function getCP(mon, ivs, ECpM) {
  const BaseAtk = mon.stats.attack
  const BaseDef = mon.stats.defense
  const BaseSta = mon.stats.stamina
  const IndAtk = ivs.atk
  const IndDef = ivs.def
  const IndSta = ivs.sta

  return Math.floor(
    (BaseAtk + IndAtk) *
    Math.pow(BaseDef + IndDef, 0.5) *
    Math.pow(BaseSta + IndSta, 0.5) *
    Math.pow(ECpM, 2) /
    10
  )
}

// The maximum possible CP for a Pokemon that has perfect IVs
function getMaxCP(mon) {
  return getCP(mon, {
    atk: 15,
    def: 15,
    sta: 15,
  }, 0.790300)
}

// The minimum CP for your Pokemon's level
function getMinCPForLevel(mon, ECpM) {
  return getCP(mon, {
    atk: 0,
    def: 0,
    sta: 0,
  }, ECpM)
}

// The maximum CP for your Pokemon's level
function getMaxCPForLevel(mon, ECpM) {
  return getCP(mon, {
    atk: 15,
    def: 15,
    sta: 15,
  }, ECpM)
}

function getAllPossibleValues(pokemon, mon, ECpM) {
  const Name = pokemon.name.toUpperCase()

  const BaseSta = mon.stats.stamina

  const IndStaValues = calcIndSta(pokemon.hp, BaseSta, ECpM)

  const MaxCP = getMaxCP(mon)
  const MaxLevelCP = getMaxCPForLevel(mon, ECpM)
  const MinLevelCP = getMinCPForLevel(mon, ECpM)

  const MaxHP = getMaxHP(mon)
  const MaxLevelHP = getMaxHPForLevel(mon, ECpM)
  const MinLevelHP = getMinHPForLevel(mon, ECpM)

  const PercentHP = Math.round(percentInRange(pokemon.hp, MinLevelHP, MaxLevelHP))
  const PercentCP = Math.round(percentInRange(pokemon.cp, MinLevelCP, MaxLevelCP))

  // Brute force find the IVs.
  // For every possible IndSta we'll loop through IndAtk and IndDef until we
  // find CPs that match your Pokemon's CP. Those are possible matches and are
  // returned by this function.
  const possibleValues = []
  IndStaValues.forEach((IndSta) => {
    for (let IndAtk = 0; IndAtk <= 15; IndAtk += 1) {
      for (let IndDef = 0; IndDef <= 15; IndDef += 1) {
        const CP = getCP(mon, {
          atk: IndAtk,
          def: IndDef,
          sta: IndSta,
        }, ECpM)
        const HP = pokemon.hp

        const PerfectIV = Math.round((IndAtk + IndDef + IndSta) / 45 * 100)
        const PercentAtk = getAttackPercentage(IndAtk, IndDef)

        if (pokemon.cp === CP) {
          possibleValues.push({
            Name,
            CP,
            HP,
            ivs: {
              IndAtk,
              IndDef,
              IndSta,
            },
            percent: {
              PercentAtk,
              PercentCP,
              PercentHP,
              PerfectIV,
            },
            meta: {
              MinLevelCP,
              MaxLevelCP,
              MinLevelHP,
              MaxLevelHP,
              MaxCP,
              MaxHP,
            },
          })
        }
      }
    }
  })

  return possibleValues
}

function calculate(pokemon) {
  // Get the pokemon's base stats
  const mon = findPokemon(pokemon.name)

  // If the level has been provided then we can get a better accurate reading
  // since we'll be able to determine the exact ECpM.
  if (pokemon.level) {
    if (DustToLevel[pokemon.stardust].indexOf(pokemon.level) === -1) {
      throw new Error('Stardust does not match level')
    }
    const ECpM = LevelToCPM[String(pokemon.level)]
    return getAllPossibleValues(pokemon, mon, ECpM)
  }

  // If we're just going on stardust then we'll have to iterate through
  // each level and concatenate all possible values
  return DustToLevel[pokemon.stardust].reduce((arr, level) => {
    const ECpM = LevelToCPM[String(level)]
    return arr.concat(getAllPossibleValues(pokemon, mon, ECpM))
  }, [])
}

function magic(pokemon) {
  const values = calculate(pokemon)

  if (!values.length) {
    console.log('I have no idea. You might have entered the wrong values.')
    return
  }

  const bestPossible = values.reduce((best, mon) => {
    if (!best) return mon
    return mon.percent.PerfectIV > best.percent.PerfectIV ? mon : best
  }, null)

  const yes = values.every(isGoodPokemon)
  const maybeValues = values.filter(isGoodPokemon)
  const maybe = maybeValues.length > 0

  const init = {
    atk: [Infinity, -Infinity],
    cp: [Infinity, -Infinity],
    hp: [Infinity, -Infinity],
    iv: [Infinity, -Infinity],
    iva: [Infinity, -Infinity],
    ivd: [Infinity, -Infinity],
    ivs: [Infinity, -Infinity],
  }

  // Calculate the min/max range of values for atk, cp, hp, and ivs
  const ValuesRange = values.reduce((obj, v) => {
    return {
      atk: [
        Math.min(v.percent.PercentAtk, obj.atk[0]),
        Math.max(v.percent.PercentAtk, obj.atk[1]),
      ],
      cp: [
        Math.min(v.percent.PercentCP, obj.cp[0]),
        Math.max(v.percent.PercentCP, obj.cp[1]),
      ],
      hp: [
        Math.min(v.percent.PercentHP, obj.hp[0]),
        Math.max(v.percent.PercentHP, obj.hp[1]),
      ],
      iv: [
        Math.min(v.percent.PerfectIV, obj.iv[0]),
        Math.max(v.percent.PerfectIV, obj.iv[1]),
      ],
      iva: [
        Math.min(v.ivs.IndAtk, obj.iva[0]),
        Math.max(v.ivs.IndAtk, obj.iva[1]),
      ],
      ivd: [
        Math.min(v.ivs.IndDef, obj.ivd[0]),
        Math.max(v.ivs.IndDef, obj.ivd[1]),
      ],
      ivs: [
        Math.min(v.ivs.IndSta, obj.ivs[0]),
        Math.max(v.ivs.IndSta, obj.ivs[1]),
      ],
    }
  }, init)

  // Begin logging
  if (values.length === 1) {
    console.log('Congrats! Here are your Pokemon\'s IVs')
    console.log()
    const pokemon = values[0]
    console.log(`IVs: ${pokemon.ivs.IndAtk}/${pokemon.ivs.IndDef}/${pokemon.ivs.IndSta}`)
    console.log(`Attack: ${pokemon.ivs.IndAtk + pokemon.ivs.IndDef} (${pokemon.percent.PercentAtk}%)`)
    console.log(`CP: ${pokemon.CP} (${pokemon.percent.PercentCP}%)`)
    console.log(`HP: ${pokemon.HP} (${pokemon.percent.PercentHP}%)`)
  } else {
    console.log(values)

    console.log()

    console.log('Range in values')
    console.log(ValuesRange)

    console.log()

    console.log('Best possible Pokemon')
    console.log(bestPossible)
  }

  console.log()

  const pokemonId = `${pokemon.name.toUpperCase()} ${pokemon.cp}`

  if (yes) {
    console.log(`>> Yes, keep your ${pokemonId}.`)
  } else if (maybe) {
    console.log(
      `>> Maybe you should keep ${pokemonId} around.`,
      '\n  ',
      `There is a ${Math.round(maybeValues.length / values.length * 100)}% chance you've got a winner.`
    )
  } else {
    console.log(`>> Send ${pokemonId} to Willow's grinder.`)
  }
}

// What this does.
// 1. Tells you if your Pokemon is "good" or not. ie: can you transfer this Pokemon?
// 2. Tells you the Pokemon's IVs.
// 3. What CP percentile it is in.
// 4. What HP percentile it is in.

// TODO
// 1. how much CP would it have if I evolved it right now to its highest form
// 2. DPS values (sans moves)
// 3. DPS values WITH moves. Plus a ranking if its a great pokemon (ideal movesets)
// 4. How much candy + stardust would it take to "max it out" according to current trainer level.
// 5. Is it worth "maxing out" my current Pokemon vs finding a better one? What are the probabilities of finding a better Pokemon?

// And the magic happens here...
magic({
  name: 'alakazam',
  cp: 523,
  hp: 54,
  stardust: 1300,
//  level: 20,
})
