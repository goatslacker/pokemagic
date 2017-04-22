const Pokemon = require('../json/pokemon.json')
const LevelToCPM = require('../json/level-to-cpm')
const comboDPS = require('./comboDPS')
const schemaMove = require('./schemaMove')
const cp = require('./cp')

// The level and IV stat to use for calculations
const N_LVL = 30
const N_IV = 15

const GymPokemon = Pokemon.filter(x => !x.evolutionBranch)

const getAvgFrom = arr => f => arr.reduce((sum, n) => sum + f(n), 0) / arr.length

const fix = n => Math.round(n * 100) / 100

const PokeCache = {}
Pokemon.forEach(mon => PokeCache[mon.name] = mon)

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

// This function's purpose is to get the avg combo dps of a move.
// our comboDPS function gets the combo DPS of moves but for a particular pokemon
function avgComboDPS(mon, move1, move2, ivAtk, pokeLevel) {
  const cache = {}
  const defenders = GymPokemon.map((opponent) => {
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
    return Object.assign({ vs: opponent.name }, res)
  })

  const goodAgainst = GymPokemon
    .map(x => Object.assign({ vs: x.name }, cache[x.name]))
    .map(x => Object.assign({
      dps: x.combo.dps,
      score: (
        x.combo.dps *
        cp.getMaxCPForLevel(PokeCache[x.vs], LevelToCPM[N_LVL])
      ),
    }, PokeCache[x.vs]))
    .filter(filterLegendaries)
    .sort((a, b) => a.score > b.score ? -1 : 1)
    .slice(0, 10)

  const badAgainst = defenders
    .sort((a, b) => a.combo.dps > b.combo.dps ? 1 : -1)
    .map(x => PokeCache[x.vs])
    .slice(0, 10)

  const avg = getAvgFrom(defenders)

  const dmg1 = avg(x => x.quick.dmg)
  const dmg2 = avg(x => x.charge.dmg)

  return {
    combo: {
      name: `${move1}/${move2}`,
      dps: fix(avg(x => x.combo.dps)),
      gymDPS: fix(avg(x => x.combo.gymDPS)),
      retired: mon.moves.combo.filter(x => x.A === move1 && x.B === move2).every(x => x.retired === true),
    },
    quick: Object.assign({}, schemaMove(mon, move1, dmg1)),
    charge: Object.assign({}, schemaMove(mon, move2, dmg2)),
    meta: { badAgainst, goodAgainst },
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
