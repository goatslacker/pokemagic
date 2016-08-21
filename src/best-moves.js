const Pokemon = require('../json/pokemon.json')

function getDmg(atk, power, stab) {
  const def = 100
  const ECpM = 0.790300
  return (0.5 * atk * ECpM / (def * ECpM ) * power * stab) + 1
}

function getDPS(dmg, duration) {
  return Number((dmg / (duration / 1000)).toFixed(2)) || 0
}

function battleDPS(atk, move1, move2, stab1, stab2) {
  const quickHits = Math.ceil(100 / move1.Energy)
  const chargeHits = Math.abs(Math.ceil(100 / move2.Energy))

  const timeToQuick = quickHits * move1.DurationMs
  const timeToCharge = chargeHits * move2.DurationMs

  const chargeDmg = getDmg(atk, move2.Power, stab2) * chargeHits
  const quickDmg = getDmg(atk, move1.Power, stab1) * quickHits

  const dps = getDPS(chargeDmg + quickDmg, timeToQuick + timeToCharge)

  return {
    quickHits,
    chargeHits,
    dps,
  }
}

function getBestMoves(mon, IndAtk) {
  const stuff = []

  mon.moves1.forEach((move1) => {
    mon.moves2.forEach((move2) => {
      const stab1 = move1.Type === mon.type1 || move1.Type === mon.type2 ? 1.25 : 1
      const stab2 = move2.Type === mon.type1 || move2.Type === mon.type2 ? 1.25 : 1

      const total = battleDPS(mon.stats.attack, move1, move2, stab1, stab2)
      const dps = total.dps

      const dmg1 = getDmg(mon.stats.attack, move1.Power, stab1)
      const dmg2 = getDmg(mon.stats.attack, move2.Power, stab2)
      const dps1 = getDPS(dmg1, move1.DurationMs)
      const dps2 = getDPS(dmg2, move2.DurationMs)

      stuff.push({
        dps,
        quick: {
          name: move1.Name,
          dps: dps1,
        },
        charge: {
          name: move2.Name,
          dps: dps2,
        },
        total,
      })
    })
  })

  return stuff.sort((a, b) => a.dps > b.dps ? -1 : 1)
}

function bestMovesFor(pokemonName, IndAtk) {
  const fmtName = pokemonName.toUpperCase().trim()
  const mon = Pokemon.filter(x => x.name === fmtName)[0]
  if (!mon) throw new Error(`Cannot find ${fmtName}`)
  return getBestMoves(mon, IndAtk || 0)
}

module.exports = bestMovesFor

/*
// Find the top 20 Pokemon with the most DPS and their moveset
console.log(
  Pokemon.reduce((arr, mon) => {
    const moves = getBestMoves(mon)
    arr.push({
      name: mon.name,
      type: `${mon.type1}/${mon.type2}`,
      dps: moves[0].dps,
    })

    // sort list by best DPS
//    moves.forEach(move => arr.push({
//      name: mon.name,
//      dps: move.dps,
//      quick: move.quick.name,
//      charge: move.charge.name,
//    }))

    return arr
  }, [])
  .sort((a, b) => {
    return a.dps > b.dps ? -1 : 1
  })
  .slice(0, 20)
)
*/

//console.log(
//  bestMovesFor(process.argv[2] || 'victreebel')
//)
