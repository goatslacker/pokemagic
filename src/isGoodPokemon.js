// 66 because that's what Candela says makes a strong Pokemon.
// I'm going to believe her. It's all about movesets anyway
const DECENT_POKEMON_RATING = 66

const getOverallRating = v => (
  v.ivs.IndAtk +
  v.ivs.IndDef +
  v.ivs.IndSta
) / 45 * 100

const isGoodPokemonForItsClass = v => getOverallRating(v) > DECENT_POKEMON_RATING

module.exports = isGoodPokemonForItsClass
