const Pokemon = require('../json/pokemon.json')
const LevelToCPM = require('../json/level-to-cpm')
const comboDPS = require('./comboDPS')
const schemaMove = require('./schemaMove')
const cp = require('./cp')

// The level and IV stat to use for calculations
const N_LVL = 30
const N_IV = 15

const Legendaries = {
  ARTICUNO: 1,
  CELEBI: 1,
  DITTO: 1,
  ENTEI: 1,
  HO_OH: 1,
  LUGIA: 1,
  MEW: 1,
  MEWTWO: 1,
  MOLTRES: 1,
  RAIKOU: 1,
  SUICUNE: 1,
  ZAPDOS: 1,
}

const filterLegendaries = x => !Legendaries.hasOwnProperty(x.name.toUpperCase())

const FinalEvos = Pokemon
  .filter(x => !x.evolutionBranch)
  .filter(filterLegendaries)

const GymPokemon = FinalEvos
  .sort((a, b) => {
    return cp.getMaxCPForLevel(a, LevelToCPM[N_LVL]) >
      cp.getMaxCPForLevel(b, LevelToCPM[N_LVL]) ? -1 : 1
  })
  // Only calculate the top 10 in CP minus legendaries. DPS is a most useful list
  .slice(0, 10)

const getAvgFrom = arr => f => arr.reduce((sum, n) => sum + f(n), 0) / arr.length

const fix = n => Math.round(n * 100) / 100

const PokeCache = {}
Pokemon.forEach(mon => PokeCache[mon.name] = mon)

const CommonGymPokemon = GymPokemon.slice(0, 6)

// This function's purpose is to get the avg combo dps of a move.
// our comboDPS function gets the combo DPS of moves but for a particular pokemon
function avgComboDPS(mon, move1, move2, ivAtk, pokeLevel) {
  const cache = {}
  FinalEvos.forEach((opponent) => {
    const res = comboDPS(
      mon,
      opponent,
      ivAtk,
      N_IV,
      pokeLevel || N_LVL,
      N_LVL,
      move1,
      move2
    )
    cache[opponent.name] = res
  })

  const goodAgainst = FinalEvos
    .map(x => Object.assign({
      dps: cache[x.name].combo.dps,
      score: (
        cache[x.name].combo.dps *
        cp.getMaxCPForLevel(PokeCache[x.name], LevelToCPM[N_LVL])
      ),
    }, PokeCache[x.name]))
    .sort((a, b) => a.score > b.score ? -1 : 1)
    .slice(0, 10)

  const badAgainst = FinalEvos
    .map(x => cache[x.name])
    .sort((a, b) => a.combo.dps > b.combo.dps ? 1 : -1)
    .map(x => PokeCache[x.name])
    .slice(0, 10)

  const common = CommonGymPokemon
    .map(x => Object.assign({
      dps: cache[x.name].combo.dps,
    }, PokeCache[x.name]))

  const dpsAverage = GymPokemon.map(x => cache[x.name])
  const avg = getAvgFrom(dpsAverage)

  const dmg1 = avg(x => x.quick.dmg)
  const dmg2 = avg(x => x.charge.dmg)

  return {
    combo: {
      name: `${move1}/${move2}`,
      dps: fix(avg(x => x.combo.dps)),
      gymDPS: fix(avg(x => x.combo.gymDPS)),
      retired: !mon.moves.quick.includes(move1) && !mon.moves.charge.includes(move2),
    },
    quick: Object.assign({}, schemaMove(mon, move1, dmg1)),
    charge: Object.assign({}, schemaMove(mon, move2, dmg2)),
    meta: { badAgainst, goodAgainst, common },
  }
}

const lookup = (name, move1Name, move2Name) => {
  const poke = Pokemon.find(x => x.name === name.toUpperCase())
  if (!poke) throw new ReferenceError('Could not find Pokemon ' + name)
  const move1 = poke.moves.quick.find(x => x === move1Name)
  const move2 = poke.moves.charge.find(x => x === move2Name)
  if (!move1) throw new ReferenceError('Could not find quick move ' + move1)
  if (!move2) throw new ReferenceError('Could not find charge move ' + move2)
  return avgComboDPS(poke, move1, move2)
}

module.exports = avgComboDPS

//console.log(
//  lookup('EXEGGUTOR', 'BULLET_SEED_FAST', 'SOLAR_BEAM').meta.goodAgainst
//)
