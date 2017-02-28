const master = require('../master')
const Pokemon = require('../og')

const pokemon = []

const maybeAccessMoves = (id, type) => Pokemon[id] ? Pokemon[id][type] : []

const buildMoves = (poke, len) => {
  if (!Pokemon[len]) {
    return poke.quickMoves.reduce((arr, move1) => {
      return arr.concat(poke.cinematicMoves.map(move2 => ({ A: move1, B: move2 })))
    }, [])
  }

  const newComboMoves = poke.quickMoves.reduce((arr, move1) => {
    return arr.concat(poke.cinematicMoves.map(move2 => ({ A: move1, B: move2 })))
  }, [])

  const cache = {}
  newComboMoves.forEach(x => cache[x.A + x.B] = 1)

  return maybeAccessMoves(len, 'moves1').reduce((arr, move1) => {
    return arr.concat(maybeAccessMoves(len, 'moves2').map(move2 => {
      if (cache.hasOwnProperty(move1.Name + move2.Name)) {
        return null
      }
      if (move1.retired || move2.retired) {
        return { A: move1.Name, B: move2.Name, retired: true }
      }
      if (!cache.hasOwnProperty(move1.Name + move2.Name)) {
        return { A: move1.Name, B: move2.Name, retired: true }
      }
      return { A: move1.Name, B: move2.Name }
    }))
  }, []).filter(Boolean).concat(newComboMoves)
}

const pokemonShape = (poke, len) => ({
  id: len + 1,
  name: poke.pokemonId,
  type1: poke.type.replace('POKEMON_TYPE_', ''),
  type2: poke.type2 ? poke.type2.replace('POKEMON_TYPE_', '') : null,
  moves: {
    combo: buildMoves(poke, len),

    quick: poke.quickMoves,

//    .map(move => ({ name: move })).concat(
//      maybeAccessMoves(len, 'moves1')
//        .filter(move => !poke.quickMoves.includes(move.Name))
//        .map(move => ({ name: move.Name, retired: true }))
//    ),
    charge: poke.cinematicMoves,
//  .map(move => ({ name: move })).concat(
//      maybeAccessMoves(len, 'moves2')
//        .filter(move => !poke.cinematicMoves.includes(move.Name))
//        .map(move => ({ name: move.Name, retired: true }))
//    ),
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

master.itemTemplates.forEach(item => {
  if (item.pokemonSettings) {
    pokemon.push(pokemonShape(item.pokemonSettings, pokemon.length))
  }
})

console.log(JSON.stringify(pokemon))
