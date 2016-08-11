const serializePokemon = {
  fromArray: function(array, startIndex = 0) {
    return fromObject({
      name: array[startIndex],
      cp: array[startIndex + 1],
      hp: array[startIndex + 2],
      stardust: array[startIndex + 3],
      level: array[startIndex + 4]
    });
  },
  fromObject: function(pokemon) {
    return {
      name: (pokemon.name || 'rhyhorn').toLowerCase(),
      cp: Number(pokemon.cp) || 634,
      hp: Number(pokemon.hp) || 103,
      stardust: Number(pokemon.stardust) || 2500,
      level: pokemon.level ? Number(pokemon.level) : null,
    }
  }
}

module.exports = serializePokemon
