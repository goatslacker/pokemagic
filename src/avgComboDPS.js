const Pokemon = require('../json/pokemon.json')
const gymDefenders = require('../json/gym-defenders.json')
const comboDPS = require('./comboDPS')
const getTypeEffectiveness = require('./getTypeEffectiveness').getTypeEffectiveness

const GymPokemon = gymDefenders.map(def => Pokemon.filter(x => x.name === def.name)[0])

const getAvgFrom = arr => f => arr.reduce((sum, n) => sum + f(n), 0) / arr.length

const getDPS = (dmg, duration) => (dmg / (duration / 1000)) || 0

// This function's purpose is to get the avg combo dps of a move.
// our comboDPS function gets the combo DPS of moves but for a particular pokemon
function avgComboDPS(mon, move1, move2) {
  const defenders = GymPokemon.map((opponent) => {
    const res = comboDPS(
      mon,
      opponent,
      10,
      10,
      30,
      30,
      move1,
      move2
    )

    return Object.assign({ vs: opponent.name }, res)
  })

  const avg = getAvgFrom(defenders)

  return {
    combo: {
      name: `${move1.Name}/${move2.Name}`,
      dps: avg(x => x.combo.dps),
      gymDPS: avg(x => x.combo.gymDPS),
    },
    quick: {
      name: move1.Name,
      dmg: avg(x => x.quick.dmg),
      time: move1.DurationMs / 1000,
      energy: move1.Energy,
      dps: avg(x => x.quick.dps),
      gymDPS: avg(x => x.quick.gymDPS),
    },
    charge: {
      name: move2.Name,
      dmg: avg(x => x.charge.dmg),
      time: move1.DurationMs / 1000,
      energy: move1.Energy,
      dps: avg(x => x.charge.dps),
      gymDPS: avg(x => x.charge.gymDPS),
    },
    meta: { defenders }
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
