'use strict'

const chalk = require('chalk')

const LevelToCPM = require('../json/level-to-cpm.json')
const DustToLevel = require('../json/dust-to-level')

const findPokemon = require('./findPokemon')
const logPokemon = require('./logPokemon')
const isGoodPokemonForItsClass = require('./isGoodPokemon')
const guessIVs = require('./guessIVs')

const init = {
  atk: [Infinity, -Infinity],
  cp: [Infinity, -Infinity],
  hp: [Infinity, -Infinity],
  iv: [Infinity, -Infinity],
  iva: [Infinity, -Infinity],
  ivd: [Infinity, -Infinity],
  ivs: [Infinity, -Infinity],
}

function magic(pokemon) {
  const results = (new IvCalculator(pokemon)).results

  if (!results.isValid()) {
    throw new Error(results.errors.join('. '))
  }

  return results
}

function sortByBest(values) {
  return values.sort((a, b) => {
    return a.percent.PerfectIV > b.percent.PerfectIV ? -1 : 1
  })
}

class IvResults {
  constructor(pokemon, results) {
    this.pokemon = pokemon
    this.errors = []

    // Filter by appraisal
    if (pokemon.attrs || pokemon.ivRange) {
      this.results = results.filter((result) => {
        var rangeCheck = true
        var statCheck = true

        if (pokemon.ivRange != null) {
          rangeCheck = (
            result.percent.PerfectIV >= pokemon.ivRange[0] &&
            result.percent.PerfectIV <= pokemon.ivRange[1]
          )
        }

        if (pokemon.attrs.length) {
          const maxiv = Math.max(
            result.ivs.IndAtk,
            result.ivs.IndDef,
            result.ivs.IndSta
          )

          statCheck = pokemon.attrs.every(attr => result.ivs[attr] === maxiv)
        }

        return rangeCheck && statCheck
      })
    } else {
      this.results = results
    }

    if (!this.results.length) {
      this.errors.push('I have no idea. You might have entered the wrong values.')
    }

    this.bestPossible = this.results.reduce((best, mon) => {
      if (!best) return mon
      return mon.percent.PerfectIV > best.percent.PerfectIV ? mon : best
    }, null)

    this.yes = this.results.every(isGoodPokemonForItsClass)
    this.maybeValues = this.results.filter(isGoodPokemonForItsClass)
    this.maybe = this.maybeValues.length > 0
    this.valuesRange = this.findValuesRange(this.results)
  }

  isValid() {
    return !this.errors.length
  }

  toString() {
    const response = []

    if (this.results.length === 1) {
      response.push('Congrats! Here are your Pokemon\'s stats')
      response.push('')

      response.push.apply(response, logPokemon(this.results[0]))
    } else {
      response.push('Your possible Pokemon\'s values')

      response.push('')

      response.push('Range in values')
      response.push(`IV: ${this.valuesRange.iv[0]} -- ${this.valuesRange.iv[1]}%`)
      response.push(`Atk+Def: ${this.valuesRange.atk[0]} -- ${this.valuesRange.atk[1]}%`)
      response.push(`CP: ${this.valuesRange.cp[0]} -- ${this.valuesRange.cp[1]}%`)
      response.push(`HP: ${this.valuesRange.hp[0]} -- ${this.valuesRange.hp[1]}%`)

      response.push('')

      response.push(`There are ${this.results.length} possibilities.`)
      if (this.results.length < 7) {
        this.results.forEach((value) => {
          const ivPercent = Math.round((value.ivs.IndAtk + value.ivs.IndDef + value.ivs.IndSta) / 45 * 100)
          response.push(`${value.ivs.IndAtk}/${value.ivs.IndDef}/${value.ivs.IndSta} (${ivPercent}%)`)
        })
      }
      response.push(`There is a ${chalk.bold(Math.round(1 / this.results.length * 100))}% chance you'll get the one below.`)

      response.push('')

      response.push('Best possible Pokemon\'s values')
      response.push.apply(response, logPokemon(this.bestPossible))
    }

    response.push('')

    const pokemonId = chalk.blue.bold(`${this.pokemon.name.toUpperCase()} ${this.pokemon.cp}`)

    if (this.yes) {
      response.push(`>> Yes, keep your ${pokemonId}.`)
    } else if (this.maybe) {
      response.push(
        `>> Maybe you should keep ${pokemonId} around.`,
        '\n  ',
        `There is a ${chalk.bold(Math.round(this.maybeValues.length / this.results.length * 100))}% chance you've got a winner.`
      )
    } else {
      response.push(`>> Send ${pokemonId} to Willow's grinder.`)
    }

    return response
  }

  asObject() {
    return {
      chance: Math.round(this.maybeValues.length / this.results.length * 100),
      best: this.bestPossible,
      pokemon: this.pokemon,
      range: this.valuesRange,
      values: sortByBest(this.results),
    }
  }

  findValuesRange(results) {
    return results.reduce((obj, v) => {
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
  }
}

class IvCalculator {
  constructor(pokemon) {
    this.pokemon = pokemon || {}
    this.results = new IvResults(pokemon, this.calculateIvResults())
  }

  calculateIvResults() {
    const mon = findPokemon(this.pokemon.name)

    // If the level has been provided then we can get a better accurate reading
    // since we'll be able to determine the exact ECpM.
    if (this.pokemon.level) {
      if (DustToLevel[this.pokemon.stardust].indexOf(this.pokemon.level) === -1) {
        throw new Error('Stardust does not match level')
      }

      const ECpM = LevelToCPM[String(this.pokemon.level)]
      return guessIVs(this.pokemon, mon, ECpM)
    }

    // If we're just going on stardust then we'll have to iterate through
    // each level and concatenate all possible values
    return DustToLevel[this.pokemon.stardust].reduce((arr, level) => {
      const ECpM = LevelToCPM[String(level)]
      return arr.concat(guessIVs(this.pokemon, mon, ECpM))
    }, [])
  }
}

module.exports = magic
