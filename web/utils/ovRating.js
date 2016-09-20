const baseCP = require('./baseCP')
const Pokemon = require('../../json/pokemon')

const poke = Pokemon.reduce((obj, mon) => {
  const cp = Math.log(baseCP(mon))
  return {
    max: Math.max(obj.max, cp),
    min: Math.min(obj.min, cp),
  }
}, {
  max: -Infinity,
  min: Infinity,
})

const SCALE = (poke.max - poke.min) / 100

const ovRating = mon => (Math.log(baseCP(mon)) - poke.min) / SCALE

module.exports = ovRating
