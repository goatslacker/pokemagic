const DECENT_POKEMON_RATING = 80

const getOverallRating = v => (
  (v.ivs.IndAtk * 1.25) +
  (v.ivs.IndDef * 1.05) +
  (v.ivs.IndSta * 0.70)
) / 45 * 100

// A good pokemon is in the 80th percentile for Atk, CP, HP, and IV.
// This 80th percentile thing was made up by me.
const isGoodPokemonForItsClass = v => getOverallRating(v) > DECENT_POKEMON_RATING

module.exports = isGoodPokemonForItsClass
