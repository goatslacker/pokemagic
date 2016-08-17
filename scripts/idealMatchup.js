const Pokemon = require('../json/pokemon.json')

const LegendaryPokemon = {
  ARTICUNO: 1,
  MEW: 1,
  MEWTWO: 1,
  MOLTRES: 1,
  ZAPDOS: 1,
}

function isNotLegendary(pokemon) {
  return !LegendaryPokemon.hasOwnProperty(pokemon.name || pokemon)
}

function getDmg(atk, power, stab) {
  const def = 100
  const ECpM = 0.790300
  return (0.5 * atk * ECpM / (def * ECpM ) * power * stab) + 1
}


function getDmgVs(player, opponent, moves) {
  const atk = player.stats.attack
  const def = opponent.stats.defense

  return moves.map((move) => {
    const stab = move.Type === player.type1 || move.Type === player.type2 ? 1.25 : 1
    const power = move.Power
    // XXX fix this we need to get proper weakness/strength
  //  const effectiveness = 1.25 || 0.8
    const effectiveness = move.Type === 'ICE' ? 1.25 : 1
    const ECpM = 0.790300
    return (0.5 * atk * ECpM / (def * ECpM ) * power * stab * effectiveness) + 1
  })
}

function effectiveness(player, opponent) {
  const moves = []

  player.moves1.forEach((move1) => {
    player.moves2.forEach((move2) => {
      const dmg1 = getDmgVs(player, opponent, [move1, move2])

      const quickHits = Math.ceil(100 / move1.Energy)
      const chargeHits = Math.abs(Math.ceil(100 / move2.Energy))

      const timeToQuick = quickHits * move1.DurationMs
      const timeToCharge = chargeHits * move2.DurationMs

      const quickDmg = dmg1[0] * quickHits
      const chargeDmg = dmg1[1] * chargeHits

      const totalTime = timeToQuick + timeToCharge
      const dps = getDPS(chargeDmg + quickDmg, totalTime)

      moves.push({
        dps,
        quick: {
          name: move1.Name,
        },
        charge: {
          name: move2.Name,
        },
      })
    })
  })

  const bestMoves = moves.sort((a, b) => a.dps > b.dps ? -1 : 1)


  const oppMoves = []
  opponent.moves1.forEach((move1) => {
    opponent.moves2.forEach((move2) => {
      const dmg1 = getDmgVs(opponent, player, [move1, move2])

      const quickHits = Math.ceil(100 / move1.Energy)
      const chargeHits = Math.abs(Math.ceil(100 / move2.Energy))

      const timeToQuick = quickHits * move1.DurationMs
      const timeToCharge = chargeHits * move2.DurationMs

      const quickDmg = dmg1[0] * quickHits
      const chargeDmg = dmg1[1] * chargeHits

      const totalTime = timeToQuick + timeToCharge

      // Slow it down to 1.5 secs
      const dps = getDPS(chargeDmg + quickDmg, totalTime) * 0.75

      oppMoves.push({
        dps,
        quick: {
          name: move1.Name,
        },
        charge: {
          name: move2.Name,
        },
      })
    })
  })

  const bestMovesOpp = oppMoves.sort((a, b) => a.dps > b.dps ? -1 : 1)

  return bestMoves.map((x) => {
    return {
      score: x.dps - bestMovesOpp[0].dps,
      quick: x.quick,
      charge: x.charge,
    }
  }).sort((a, b) => a.score > b.score ? -1 : 1)
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

      const total = battleDPS(mon.stats.attack + IndAtk, move1, move2, stab1, stab2)
      const dps = total.dps

      const dmg1 = getDmg(mon.stats.attack + IndAtk, move1.Power, stab1)
      const dmg2 = getDmg(mon.stats.attack + IndAtk, move2.Power, stab2)
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

function bestPokemonVs(opponentName) {
  const opponent = Pokemon.filter(x => x.name === opponentName.toUpperCase())[0]
  return (
    Pokemon.reduce((arr, mon) => {
      const moves = effectiveness(mon, opponent)
      moves.forEach(move => arr.push({
        name: mon.name,
        score: move.score,
        quick: move.quick.name,
        charge: move.charge.name,
      }))
      return arr
    }, [])
    .filter(isNotLegendary)
    .sort((a, b) => {
      return a.score > b.score ? -1 : 1
    })
    .slice(0, 10)
  )
}

module.exports = bestMovesFor

// Find the top 20 Pokemon with the most DPS and their moveset
//console.log(
//  Pokemon.reduce((arr, mon) => {
//    const moves = getBestMoves(mon)
//    moves.forEach(move => arr.push({
//      name: mon.name,
//      dps: move.dps,
//      quick: move.quick.name,
//      charge: move.charge.name,
//    }))
//    return arr
//  }, [])
//  .sort((a, b) => {
//    return a.dps > b.dps ? -1 : 1
//  })
//  .slice(0, 20)
//)

const Cloyster = Pokemon.filter(x => x.name === 'ARCANINE')[0]
const Dragonite = Pokemon.filter(x => x.name === 'SNORLAX')[0]

console.log(bestPokemonVs(process.argv[2] || 'vaporeon'))

//console.log(
//  JSON.stringify(effectiveness(Cloyster, Dragonite))
//  '*********************',
//  bestMovesFor('cloyster')
//)
