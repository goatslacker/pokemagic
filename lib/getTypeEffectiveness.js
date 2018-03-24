const Effectiveness = require('../json/effectiveness');

function getTypeEffectiveness(pokemon, move) {
  if (pokemon.type2) {
    const key1 = `${move.Type}+${pokemon.type1}/${pokemon.type2}`;
    if (Effectiveness.hasOwnProperty(key1)) return Effectiveness[key1];

    const key2 = `${move.Type}+${pokemon.type2}/${pokemon.type1}`;
    if (Effectiveness.hasOwnProperty(key2)) return Effectiveness[key2];
  }

  const key1 = `${move.Type}+${pokemon.type1}`;
  if (Effectiveness.hasOwnProperty(key1)) return Effectiveness[key1];

  return null;
}

module.exports = getTypeEffectiveness;
