const Pokemon = require('../json/pokemon')
const LevelToCpM = require('../json/level-to-cpm')
const cpTools = require('./cp')

function percentInRange(num, min, max) {
  return Math.round(((num - min) * 100) / (max - min))
}

// This module calculates the CP range for the Pokemon's type and the CP range
// overall relative to all Pokemon.

// TODO instead of using ECpM just calculate it with max level. You pass it the IVs
// and it'll calculate the % relative to overall and type.
// TODO cache the min/max
// return just the value
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

// TODO cache the min/max
// return just the value
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

// TODO rename to range.forType and range.overall
module.exports = {
  getCPRangeForType,
  getCPRangeOverall,
}
