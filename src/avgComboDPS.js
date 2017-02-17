const Pokemon = require('../json/pokemon.json')
const gymDefenders = require('../json/gym-defenders.json')
const comboDPS = require('./comboDPS')
const schemaMove = require('./schemaMove')
//const pokeRatings = require('./pokeRatings')

const GymPokemon = gymDefenders.map(def => Pokemon.filter(x => x.name === def.name)[0])

const getAvgFrom = arr => f => arr.reduce((sum, n) => sum + f(n), 0) / arr.length

const fix = n => Math.round(n * 100) / 100

// This function's purpose is to get the avg combo dps of a move.
// our comboDPS function gets the combo DPS of moves but for a particular pokemon
function avgComboDPS(mon, move1, move2, ivAtk, pokeLevel) {
  const defenders = GymPokemon.map((opponent) => {
    const res = comboDPS(
      mon,
      opponent,
      ivAtk || 10,
      10,
      pokeLevel || 30,
      30,
      move1,
      move2
    )

    // TODO TTL and then sort by "score" like bestVs

    return Object.assign({ vs: opponent.name }, res)
  })

  const avg = getAvgFrom(defenders)

  const dmg1 = avg(x => x.quick.dmg)
  const dmg2 = avg(x => x.charge.dmg)

  return {
    combo: {
      name: `${move1.name}/${move2.name}`,
      dps: fix(avg(x => x.combo.dps)),
      gymDPS: fix(avg(x => x.combo.gymDPS)),
      retired: move1.retired === true || move2.retired == true,
    },
    quick: Object.assign({}, schemaMove(mon, move1, dmg1)),
    charge: Object.assign({}, schemaMove(mon, move2, dmg2)),
    meta: { defenders },
//    rating: pokeRatings.getRating(mon, move1, move2),
  }
}

module.exports = avgComboDPS

//console.log(
//  avgComboDPS(
//    Pokemon.filter(x => x.name === 'VAPOREON')[0],
//    Pokemon.filter(x => x.name === 'VAPOREON')[0].moves.quick[0],
//    Pokemon.filter(x => x.name === 'VAPOREON')[0].moves.charge[1]
//  )
//)
