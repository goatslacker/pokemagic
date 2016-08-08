const Pokemon = require('../json/pokemon')

function findPokemon(name) {
  const fmtName = name.toUpperCase()

  return Object.keys(Pokemon).reduce((a, key) => {
    if (a) return a
    if (Pokemon[key].name === fmtName) return Pokemon[key]
    return null
  }, null)
}

module.exports = findPokemon
