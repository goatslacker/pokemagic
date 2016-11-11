const Pokemon = require('../json/pokemon')
const LevelToCpM = require('../json/level-to-cpm')
const cpTools = require('./cp')

function percentInRange(num, min, max) {
  return Math.round(((num - min) * 100) / (max - min))
}

function getCPRangeForPokemon(mon, level, cp) {
  const ECpM = LevelToCpM[level]
  const min = cpTools.getMinCPForLevel(mon, ECpM)
  const max = cpTools.getMaxCPForLevel(mon, ECpM)

  return {
    min,
    max,
    value: percentInRange(cp, min, max),
  }
}

function getCPRangeOverall(level, cp) {
  const ECpM = LevelToCpM[level]
  const minmax = Pokemon.reduce((obj, mon) => {
    const min = cpTools.getMinCPForLevel(mon, ECpM)
    const max = cpTools.getMaxCPForLevel(mon, ECpM)

    return {
      min: Math.min(obj.min, min),
      max: Math.max(obj.max, max),
    }
  }, { min: Infinity, max: -Infinity })

  return {
    min: minmax.min,
    max: minmax.max,
    value: percentInRange(cp, minmax.min, minmax.max),
  }
}

function getCPRangeForType(type, level, cp) {
  const ECpM = LevelToCpM[level]
  const minmax = Pokemon.reduce((obj, mon) => {
    if (mon.type1 === type || mon.type2 === type) {
      const min = cpTools.getMinCPForLevel(mon, ECpM)
      const max = cpTools.getMaxCPForLevel(mon, ECpM)

      return {
        min: Math.min(obj.min, min),
        max: Math.max(obj.max, max),
      }
    }

    return obj
  }, { min: Infinity, max: -Infinity })

  return {
    min: minmax.min,
    max: minmax.max,
    value: percentInRange(cp, minmax.min, minmax.max),
  }
}

module.exports = {
  getCPRangeForType,
  getCPRangeOverall,
  getCPRangeForPokemon,
}
