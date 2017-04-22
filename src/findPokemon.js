const Pokemon = require('../json/pokemon')

const cache = {}
module.exports = uname => {
  const name = uname.toUpperCase()
  if (cache[name]) return cache[name]
  const poke = Pokemon.filter(x => x.name === name)[0]
  if (poke) cache[name] = poke
  return poke
}
