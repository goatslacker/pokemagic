const Pokemon = require('../json/pokemon.json')
const gymDefenders = require('../json/gym-defenders.json')
const comboDPS = require('./comboDPS')
const getTypeEffectiveness = require('./getTypeEffectiveness').getTypeEffectiveness
const schemaMove = require('./schemaMove')
//const pokeRatings = require('./pokeRatings')

const GymPokemon = gymDefenders.map(def => Pokemon.filter(x => x.name === def.name)[0])

const getAvgFrom = arr => f => arr.reduce((sum, n) => sum + f(n), 0) / arr.length

const getDPS = (dmg, duration) => (dmg / (duration / 1000)) || 0

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

    return Object.assign({ vs: opponent.name }, res)
  })

  const avg = getAvgFrom(defenders)

  const dmg1 = avg(x => x.quick.dmg)
  const dmg2 = avg(x => x.charge.dmg)

  return {
    combo: {
      name: `${move1.Name}/${move2.Name}`,
      dps: avg(x => x.combo.dps),
      gymDPS: avg(x => x.combo.gymDPS),
    },
    quick: Object.assign({}, schemaMove(mon, move1, dmg1)),
    charge: Object.assign({}, schemaMove(mon, move2, dmg2)),
    meta: { defenders },
//    rating: pokeRatings.getRating(mon, move1.Name, move2.Name),
  }
}

module.exports = avgComboDPS

//console.log(
//  avgComboDPS(
//    Pokemon.filter(x => x.name === 'VAPOREON')[0],
//    Pokemon.filter(x => x.name === 'VAPOREON')[0].moves1[0],
//    Pokemon.filter(x => x.name === 'VAPOREON')[0].moves2[1]
//  )
//)
