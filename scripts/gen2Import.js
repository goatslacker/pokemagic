const master = require('../master')
const Pokemon = require('../json/pokemon')

const pokemon = []
const moves = {}

const maybeAccessMoves = (id, type) => Pokemon[id] ? Pokemon[id][type] : []

const pokemonShape = (poke, len) => ({
  id: len + 1,
  name: poke.pokemonId,
  type1: poke.type.replace('POKEMON_TYPE_', ''),
  type2: poke.type2 ? poke.type2.replace('POKEMON_TYPE_', '') : null,
  moves: {
    quick: poke.quickMoves.map(move => ({ name: move })).concat(
      maybeAccessMoves(len, 'moves1')
        .filter(move => !poke.quickMoves.includes(move.Name))
        .map(move => ({ name: move.Name, retired: true }))
    ),
    charge: poke.cinematicMoves.map(move => ({ name: move })).concat(
      maybeAccessMoves(len, 'moves2')
        .filter(move => !poke.cinematicMoves.includes(move.Name))
        .map(move => ({ name: move.Name, retired: true }))
    ),
  },
  stats: {
    stamina: poke.stats.baseStamina,
    attack: poke.stats.baseAttack,
    defense: poke.stats.baseDefense,
  },
  family: poke.familyId,
  parentPokemonId: poke.parentPokemonId,
  candy: poke.candyToEvolve,
  kmBuddyDistance: poke.kmBuddyDistance,
  evolutionBranch: poke.evolutionBranch,
})

const moveShape = move => ({
  Name: move.movementId,
  Type: move.pokemonType.replace('POKEMON_TYPE_', ''),
  Power: move.power,
  DurationMs: move.durationMs,
  Energy: move.energyDelta,
  DamageWindowStartMs: move.damageWindowStartMs,
  DamageWindowEndMs: move.damageWindowEndMs,
})

master.itemTemplates.forEach(item => {
//  if (item.pokemonSettings) {
//    pokemon.push(pokemonShape(item.pokemonSettings, pokemon.length))
//  }

  if (item.moveSettings) {
    moves[item.moveSettings.movementId] = moveShape(item.moveSettings)
  }
})

//console.log(JSON.stringify(pokemon))
console.log(JSON.stringify(moves))
