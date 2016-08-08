const chalk = require('chalk')

const LevelToCPM = require('../json/level-to-cpm.json')
const Levels = require('../json/levels')
const cpTools = require('./cp')
const hpTools = require('./hp')

const TRAINER_LEVEL = 25

const OK_ATK = 106
const OK_DEF = 106
const OK_STA = 100
const OK_HP = 100
const DECE_CP = cpTools.getCP({
  stats: {
    attack: 150,
    defense: 150,
    stamina: 150,
  },
}, { atk: 15, def: 15, sta: 15 }, LevelToCPM[TRAINER_LEVEL + 1.5])

const MAX_OVERALL_RATING = 385
const DECENT_POKEMON_RATING = 309

const getOverallRating = (
  v => v.percent.PerfectIV +
       v.percent.PercentCP +
       v.percent.PercentBatt +
       (v.percent.PercentHP * 0.85)
)

function colorPercent(num, mod) {
  const mul = num * (mod || 1)
  if (mul < 70) {
    return chalk.red(num + '%')
  } else if (mul < 90) {
    return chalk.yellow(num + '%')
  }
  return chalk.green.bold(num + '%')
}

function logPokemon(pokemon) {
  console.log(`IVs: ${pokemon.ivs.IndAtk}/${pokemon.ivs.IndDef}/${pokemon.ivs.IndSta} (${colorPercent(pokemon.percent.PerfectIV)})`)
  console.log(`Atk+Def: ${pokemon.ivs.IndAtk + pokemon.ivs.IndDef}/30 (${colorPercent(pokemon.percent.PercentBatt)})`)
  console.log(`CP: ${pokemon.CP} (${colorPercent(pokemon.percent.PercentCP, 1.05)})`)
  console.log(`HP: ${pokemon.HP} (${colorPercent(pokemon.percent.PercentHP, 1.5)})`)

  // XXX it would be better to know how far off from "perfect" this pokemon is
  console.log(`Atk: ${pokemon.Atk.toFixed(2)} (+${(pokemon.Atk - OK_ATK).toFixed(2)})`)
  console.log(`Def: ${pokemon.Def.toFixed(2)} (+${(pokemon.Def - OK_DEF).toFixed(2)})`)
  console.log(`Sta: ${pokemon.Sta.toFixed(2)} (+${(pokemon.Sta - OK_STA).toFixed(2)})`)

  console.log()

  const ovCP = Math.round(pokemon.meta.MaxCP / DECE_CP * 100)

  console.log(`At level ${TRAINER_LEVEL + 1.5}, this pokemon would have:`)
  console.log(`Maximum CP: ${pokemon.meta.MaxCP}`)
  console.log(`Maximum HP: ${pokemon.meta.MaxHP}`)
  console.log(`Overall CP Rating: ${ovCP}%`)

  console.log()

  console.log(`If evolved, it would have ~${pokemon.meta.EvolveCP}CP and a Max CP of ~${pokemon.meta.MaxEvolveCP}CP`)
  console.log(`It would take ${chalk.bold(pokemon.meta.Stardust)} stardust and ${chalk.bold(pokemon.meta.Candy)} candy to max this pokemon out`)

  const ovRating = getOverallRating(pokemon)
  const ovRatingPercent = Math.round(ovRating / MAX_OVERALL_RATING * 100)

  console.log()

  console.log(`${pokemon.Name} Rating: ${ovRatingPercent}%`)
}

module.exports = logPokemon
