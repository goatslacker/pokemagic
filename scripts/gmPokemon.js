const GameMaster = require('./GameMaster');

const prettyWrite = require('./prettyWrite');
const done = require('./done');

function type(t) {
  return t ? t.replace('POKEMON_TYPE_', '') : null;
}

GameMaster.then(data => {
  const Pokemon = data.itemTemplates
    .filter(x => x.hasOwnProperty('pokemonSettings'))
    .map(({ pokemonSettings }, i) => ({
      id: i + 1,
      name: pokemonSettings.pokemonId,
      type1: type(pokemonSettings.type),
      type2: type(pokemonSettings.type2),
      moves: {
        quick: pokemonSettings.quickMoves,
        charge: pokemonSettings.cinematicMoves,
      },
      stats: {
        stamina: pokemonSettings.stats.baseStamina,
        attack: pokemonSettings.stats.baseAttack,
        defense: pokemonSettings.stats.baseDefense,
      },
      family: pokemonSettings.familyId,
      parentPokemonId: pokemonSettings.parentPokemonId,
      kmBuddyDistance: pokemonSettings.kmBuddyDistance,
      evolutionBranch: pokemonSettings.evolutionBranch,
      captureRate: pokemonSettings.encounter.baseCaptureRate,
      fleeRate: pokemonSettings.encounter.baseFleeRate,
      height: pokemonSettings.pokedexHeightM,
      weight: pokemonSettings.pokedexWeightKg,
    }));

  prettyWrite('./json/pokemon.json', Pokemon);
  done('Pokemon');
});
