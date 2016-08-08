const MAX_OVERALL_RATING = 385
const DECENT_POKEMON_RATING = 309

const getOverallRating = (
  v => v.percent.PerfectIV +
       v.percent.PercentCP +
       v.percent.PercentBatt +
       (v.percent.PercentHP * 0.85)
)

// A good pokemon is in the 80th percentile for Atk, CP, HP, and IV.
// This 80th percentile thing was made up by me.
const isGoodPokemonForItsClass = v => getOverallRating(v) > DECENT_POKEMON_RATING

module.exports = isGoodPokemonForItsClass
