'use strict'

const chalk = require('chalk')

const Pokemon = require('./pokemon.json')
const Moves = require('./moves.json')
const LevelToCPM = require('./level-to-cpm.json')
const Levels = require('./levels')
const CPM = require('./cpm.json')

// These are values that I consider "baseline" for what makes a good pokemon
const OK_ATK = 106
const OK_DEF = 106
const OK_STA = 100
const OK_HP = 100

const TRAINER_LEVEL = 24

const MAX_OVERALL_RATING = 385
const DECENT_POKEMON_RATING = 309

function findPokemon(name) {
  const fmtName = name.toUpperCase()

  return Object.keys(Pokemon).reduce((a, key) => {
    if (a) return a
    if (Pokemon[key].name === fmtName) return Pokemon[key]
    return null
  }, null)
}

function getMaxLevel() {
  return LevelToCPM[String(TRAINER_LEVEL + 1.5)]
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

const getOverallRating = (
  v => v.percent.PerfectIV +
       v.percent.PercentCP +
       v.percent.PercentBatt +
       (v.percent.PercentHP * 0.85)
)

// A good pokemon is in the 80th percentile for Atk, CP, HP, and IV.
// This 80th percentile thing was made up by me.
const isGoodPokemonForItsClass = v => getOverallRating(v) > DECENT_POKEMON_RATING

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
function getMaxHP(mon, sta, ECpM) {
  return getHP(mon, sta, ECpM)
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
function getMaxCP(mon, atk, def, sta, ECpM) {
  return getCP(mon, { atk, def, sta }, ECpM)
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

function getPokemonDataForStats(mon, level, IndAtk, IndDef, IndSta) {
  const ECpM = LevelToCPM[String(level)]

  const CP = getCP(mon, {
    atk: IndAtk,
    def: IndDef,
    sta: IndSta,
  }, ECpM)
  const HP = getHP(mon, IndSta, ECpM)

  const BaseAtk = mon.stats.attack
  const Atk = (BaseAtk + IndAtk) * ECpM

  const BaseDef = mon.stats.defense
  const Def = (BaseDef + IndDef) * ECpM

  const BaseSta = mon.stats.stamina
  const Sta = (BaseSta + IndSta) * ECpM

  const MaxCP = getMaxCP(mon, IndAtk, IndDef, IndSta, getMaxLevel())
  const MaxHP = getMaxHP(mon, IndSta, getMaxLevel())

  const PerfectIV = Math.round((IndAtk + IndDef + IndSta) / 45 * 100)
  const PercentBatt = getAttackPercentage(IndAtk, IndDef)

  const MaxLevelCP = getMaxCPForLevel(mon, ECpM)
  const MinLevelCP = getMinCPForLevel(mon, ECpM)

  const MaxLevelHP = getMaxHPForLevel(mon, ECpM)
  const MinLevelHP = getMinHPForLevel(mon, ECpM)

  const PercentHP = Math.round(percentInRange(HP, MinLevelHP, MaxLevelHP))
  const PercentCP = Math.round(percentInRange(CP, MinLevelCP, MaxLevelCP))

  return {
    CP,
    HP,
    Atk,
    Def,
    Sta,
    ivs: {
      IndAtk,
      IndDef,
      IndSta,
    },
    percent: {
      PercentCP,
      PercentHP,
      PercentBatt,
      PerfectIV,
    },
    meta: {
      MaxCP,
      MaxHP,
    },
  }
}

function getAllPossibleValues(pokemon, mon, ECpM) {
  const Name = pokemon.name.toUpperCase()

  const BaseSta = mon.stats.stamina

  const IndStaValues = calcIndSta(pokemon.hp, BaseSta, ECpM)

  const MaxLevelCP = getMaxCPForLevel(mon, ECpM)
  const MinLevelCP = getMinCPForLevel(mon, ECpM)

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

        const BaseAtk = mon.stats.attack
        const Atk = (BaseAtk + IndAtk) * ECpM

        const BaseDef = mon.stats.defense
        const Def = (BaseDef + IndDef) * ECpM

        const BaseSta = mon.stats.stamina
        const Sta = (BaseSta + IndSta) * ECpM

        const MaxCP = getMaxCP(mon, IndAtk, IndDef, IndSta, getMaxLevel())
        const MaxHP = getMaxHP(mon, IndSta, getMaxLevel())

        const PerfectIV = Math.round((IndAtk + IndDef + IndSta) / 45 * 100)
        const PercentBatt = getAttackPercentage(IndAtk, IndDef)

        if (pokemon.cp === CP) {
          possibleValues.push({
            Name,
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
            percent: {
              PercentBatt,
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

function colorPercent(num, mod) {
  const mul = num * (mod || 1)
  if (mul < 70) {
    return chalk.red(num + '%')
  } else if (mul < 90) {
    return chalk.yellow(num + '%')
  }
  return chalk.green.bold(num + '%')
}

function logPokemon(pokemon) {
  console.log(`IVs: ${pokemon.ivs.IndAtk}/${pokemon.ivs.IndDef}/${pokemon.ivs.IndSta} (${colorPercent(pokemon.percent.PerfectIV)})`)
  console.log(`Atk+Def: ${pokemon.ivs.IndAtk + pokemon.ivs.IndDef}/30 (${colorPercent(pokemon.percent.PercentBatt)})`)
  console.log(`CP: ${pokemon.CP} (${colorPercent(pokemon.percent.PercentCP, 1.05)})`)
  console.log(`HP: ${pokemon.HP} (${colorPercent(pokemon.percent.PercentHP, 1.5)})`)

  console.log(`Atk: ${pokemon.Atk.toFixed(2)} (+${(pokemon.Atk - OK_ATK).toFixed(2)})`)
  console.log(`Def: ${pokemon.Def.toFixed(2)} (+${(pokemon.Def - OK_DEF).toFixed(2)})`)
  console.log(`Sta: ${pokemon.Sta.toFixed(2)} (+${(pokemon.Sta - OK_STA).toFixed(2)})`)

  console.log()

  console.log(`At level ${TRAINER_LEVEL + 1.5}, this pokemon would have:`)
  console.log(`Maximum CP: ${pokemon.meta.MaxCP}`)
  console.log(`Maximum HP: ${pokemon.meta.MaxHP}`)

  console.log()

  const ovRating = getOverallRating(pokemon)
  const ovRatingPercent = Math.round(ovRating / MAX_OVERALL_RATING * 100)
  const plusMinusRating = (ovRating - DECENT_POKEMON_RATING).toFixed(1)

  const deceCP = getCP({
    stats: {
      attack: 150,
      defense: 150,
      stamina: 150,
    },
  }, { atk: 15, def: 15, sta: 15 }, LevelToCPM[TRAINER_LEVEL + 1.5])
  const ovCP = Math.round(pokemon.meta.MaxCP / deceCP)

  console.log(`Overall Rating: ${ovRatingPercent}% (${ovRating} +${plusMinusRating})`)
  console.log(`Overall CP Rating: ${ovCP}%`)
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

  const yes = values.every(isGoodPokemonForItsClass)
  const maybeValues = values.filter(isGoodPokemonForItsClass)
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
        Math.min(v.percent.PercentBatt, obj.atk[0]),
        Math.max(v.percent.PercentBatt, obj.atk[1]),
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
    console.log('Congrats! Here are your Pokemon\'s stats')
    console.log()

    logPokemon(values[0])
  } else {
    console.log('Your possible Pokemon\'s values')

    console.log()

    console.log('Range in values')
    console.log(`IV: ${ValuesRange.iv[0]} -- ${ValuesRange.iv[1]}%`)
    console.log(`Atk+Def: ${ValuesRange.atk[0]} -- ${ValuesRange.atk[1]}%`)
    console.log(`CP: ${ValuesRange.cp[0]} -- ${ValuesRange.cp[1]}%`)
    console.log(`HP: ${ValuesRange.hp[0]} -- ${ValuesRange.hp[1]}%`)

    console.log()

    console.log(`There are ${values.length} possibilities.`)
    console.log(`There is a ${chalk.bold(Math.round(1 / values.length * 100))}% chance you'll get the one below.`)

    console.log()

    console.log('Best possible Pokemon\'s values')
    logPokemon(bestPossible)
  }

  const maxLevel = Math.max.apply(null, DustToLevel[pokemon.stardust])
  // XXX shit what is your trainer level!?

  const x = howMuchPowerUp(maxLevel, TRAINER_LEVEL)
  const stardust = x.stardust
  const candy = x.candy

  console.log()

  if (CPM[pokemon.name.toUpperCase()]) {
    const evolveCP = Math.round(CPM[pokemon.name.toUpperCase()][1] * pokemon.cp)
    console.log(`If evolved, it would have ~${evolveCP}CP`)
  }

  console.log(`It would take ${chalk.bold(stardust)} stardust and ${chalk.bold(candy)} candy to max this pokemon out`)

  console.log()

  const pokemonId = chalk.blue.bold(`${pokemon.name.toUpperCase()} ${pokemon.cp}`)

  if (yes) {
    console.log(`>> Yes, keep your ${pokemonId}.`)
  } else if (maybe) {
    console.log(
      `>> Maybe you should keep ${pokemonId} around.`,
      '\n  ',
      `There is a ${chalk.bold(Math.round(maybeValues.length / values.length * 100))}% chance you've got a winner.`
    )
  } else {
    console.log(`>> Send ${pokemonId} to Willow's grinder.`)
  }
}

function howMuchStardust(currentLevel, trainerLevel) {
  const maxPokemonLevel = trainerLevel + 1.5

  // Returns the candy cost of upgrading to the current maximum Pokemon level
  // cap based on the trainer's level
  return Object.keys(DustToLevel).reduce((sum, dust) => {
    const levels = DustToLevel[dust]
    const stardustIncrease = levels.reduce((num, level) => {
      return level > currentLevel && level <= maxPokemonLevel
        ? num + Number(dust)
        : num
    }, 0)

    return sum + stardustIncrease
  }, 0)
}

// XXX
function howMuchCandy(currentLevel, trainerLevel) {
  const maxLevel = (trainerLevel + 1.5) * 2
  const minLevel = currentLevel * 2
  return Levels.reduce((sum, level) => {
    if (level.level <= maxLevel && level.level > minLevel) return sum + level.candy
    return sum
  }, 0)
}

function howMuchPowerUp(currentLevel, trainerLevel) {
  const candy = howMuchCandy(currentLevel, trainerLevel)
  const stardust = howMuchStardust(currentLevel, trainerLevel)
  return { candy, stardust }
}

// XXX
function pokemonsEvolvedCP() {
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
// 6. A function for best pokemon for that specific type, and a comparison/diff of how far you're off from that pokemon
// 7. list number of matches or confidence level!

// And the magic happens here...
magic({
  name: process.argv[2] || 'rhyhorn',
  cp: Number(process.argv[3]) || 634,
  hp: Number(process.argv[4]) || 103,
  stardust: Number(process.argv[5]) || 2500,
  level: process.argv[6] ? Number(process.argv[6]) : null,
})

//logPokemon(
//  getPokemonDataForStats(
//    findPokemon('gyarados'),
//    20, 15, 15, 15
//  )
//)
