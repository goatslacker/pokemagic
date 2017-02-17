const master = require('../master')

const pokemon = []
const moves = {}

const pokemonShape = poke => Object.assign({}, poke, {
  type1: poke.type.replace('POKEMON_TYPE_', ''),
  type2: poke.type2 ? poke.type2.replace('POKEMON_TYPE_', '') : null,
  stats: {
    stamina: poke.stats.baseStamina,
    attack: poke.stats.baseAttack,
    defense: poke.stats.baseDefense,
  },
})

master.itemTemplates.forEach(item => {
  if (item.pokemonSettings) {
    pokemon.push(pokemonShape(item.pokemonSettings))
  }

  if (item.moveSettings) {
    moves[item.moveSettings.movementId] = item.moveSettings
  }
})

console.log(JSON.stringify(pokemon))
