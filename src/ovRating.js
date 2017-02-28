const atkCP = require('./atkCP')
const defCP = require('./defCP')
const Pokemon = require('../json/pokemon')

const atk = Pokemon.reduce((obj, mon) => {
  const cp = Math.log(atkCP(mon))
  return {
    max: Math.max(obj.max, cp),
    min: Math.min(obj.min, cp),
  }
}, {
  max: -Infinity,
  min: Infinity,
})

const def = Pokemon.reduce((obj, mon) => {
  const cp = Math.log(defCP(mon))
  return {
    max: Math.max(obj.max, cp),
    min: Math.min(obj.min, cp),
  }
}, {
  max: -Infinity,
  min: Infinity,
})

const total = Pokemon.reduce((obj, mon) => {
  const cp = Math.log(atkCP(mon)) + Math.log(defCP(mon))
  return {
    max: Math.max(obj.max, cp),
    min: Math.min(obj.min, cp),
  }
}, {
  max: -Infinity,
  min: Infinity,
})

const ATK_SCALE = (atk.max - atk.min) / 100
const DEF_SCALE = (def.max - def.min) / 100
const OVR_SCALE = (total.max - total.min) / 100

const ovRating = mon => ({
  ovr: Math.round((Math.log(atkCP(mon)) + Math.log(defCP(mon)) - total.min) / OVR_SCALE),
  atk: Math.round((Math.log(atkCP(mon)) - atk.min) / ATK_SCALE),
  def: Math.round((Math.log(defCP(mon)) - def.min) / DEF_SCALE),
})

module.exports = ovRating
