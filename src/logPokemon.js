const chalk = require('chalk')

const LevelToCPM = require('../json/level-to-cpm.json')
const Levels = require('../json/levels')
const cpTools = require('./cp')
const hpTools = require('./hp')

const TRAINER_LEVEL = 26

const getOverallRating = v => (
  (v.ivs.IndAtk * 1.10) +
  (v.ivs.IndDef * 1.05) +
  (v.ivs.IndSta * 0.85)
) / 45 * 100

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
  const response = []

  response.push(`Level: ${pokemon.Level}`)
  response.push(`IVs: ${pokemon.ivs.IndAtk}/${pokemon.ivs.IndDef}/${pokemon.ivs.IndSta} (${colorPercent(pokemon.percent.PerfectIV)})`)
  response.push(`Atk+Def: ${pokemon.ivs.IndAtk + pokemon.ivs.IndDef}/30 (${colorPercent(pokemon.percent.PercentBatt)})`)
  response.push(`CP: ${pokemon.CP} (${colorPercent(pokemon.percent.PercentCP, 1.05)})`)
  response.push(`HP: ${pokemon.HP} (${colorPercent(pokemon.percent.PercentHP, 1.5)})`)

  response.push(`Atk: ${pokemon.Atk.toFixed(2)}`)
  response.push(`Def: ${pokemon.Def.toFixed(2)}`)
  response.push(`Sta: ${pokemon.Sta.toFixed(2)}`)

  response.push('')

  response.push(`At level ${TRAINER_LEVEL + 1.5}, this pokemon would have:`)
  response.push(`Maximum CP: ${pokemon.meta.MaxCP}/${pokemon.meta.MaxLeveledCP}`)
  response.push(`Maximum HP: ${pokemon.meta.MaxHP}/${pokemon.meta.MaxLeveledHP}`)

  if (pokemon.meta.EvolveCP || pokemon.meta.Stardust) {
    response.push('')
  }

  if (pokemon.meta.EvolveCP) {
    response.push(`If evolved, it would have ~${pokemon.meta.EvolveCP}CP with a max of ~${pokemon.meta.MaxEvolveCP}CP`)
  }

  if (pokemon.meta.Stardust) {
    response.push(`It would take ${chalk.bold(pokemon.meta.Stardust)} stardust and ${chalk.bold(pokemon.meta.Candy)} candy to max this pokemon out`)
  }

  const ovRating = getOverallRating(pokemon)
  const ovRatingPercent = Math.round(ovRating)

  response.push('')

  response.push(`${pokemon.Name} Rating: ${ovRatingPercent}%`)

//  return response

  return {
    level: pokemon.Level,
    name: pokemon.Name,
    iv: `${pokemon.ivs.IndAtk}/${pokemon.ivs.IndDef}/${pokemon.ivs.IndSta}`,
    ivp: pokemon.percent.PerfectIV,
    atkdef: `${pokemon.ivs.IndAtk + pokemon.ivs.IndDef}/30`,
    atkdefp: pokemon.percent.PercentBatt,
    cp: pokemon.CP,
    cpp: pokemon.percent.PercentCP,
    hp: pokemon.HP,
    hpp: pokemon.percent.PercentHP,
    atk: pokemon.Atk.toFixed(2),
    def: pokemon.Def.toFixed(2),
    sta: pokemon.Sta.toFixed(2),
    maxlevel: TRAINER_LEVEL + 1.5,
    maxcp: `${pokemon.meta.MaxCP}/${pokemon.meta.MaxLeveledCP}`,
    maxhp: `${pokemon.meta.MaxHP}/${pokemon.meta.MaxLeveledHP}`,
    rating: Math.round(getOverallRating(pokemon)),
    stardust: pokemon.meta.Stardust,
    candy: pokemon.meta.Candy,
    value: pokemon,
  }
}

module.exports = logPokemon
