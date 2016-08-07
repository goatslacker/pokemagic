const Pokemon = require('./pokemon.json')

function getDmg(atk, power, stab) {
  const def = 100
  const ECpM = 0.790300
  return Math.floor((0.5 * atk * ECpM / (def * ECpM ) * power * stab) + 1)
}

function getDPS(dmg, duration) {
  return (dmg / (duration / 1000)).toFixed(2)
}

function bestMovesFor(pokemonName) {
  const fmtName = pokemonName.toUpperCase()
  const mon = Pokemon.filter(x => x.name === fmtName)[0]

  if (!mon) throw new Error(`Cannot find ${fmtName}`)

  const stuff = []

  mon.moves1.forEach((move1) => {
    mon.moves2.forEach((move2) => {
      const totalEnergy = 10 * move1.Energy
      const howManyCharges = Math.abs(totalEnergy / move2.Energy)

      const atk = mon.stats.attack
      const stab1 = move1.Type === mon.type1 || move1.Type === mon.type2 ? 1.25 : 1
      const stab2 = move2.Type === mon.type1 || move2.Type === mon.type2 ? 1.25 : 1

      const ECpM = 0.790300
      // The defending Pokemon's level will be set at just 100
      const def = 100

      const dmg1 = getDmg(atk, move1.Power, stab1)
      const dmg2 = getDmg(atk, move2.Power, stab2)

      const dps1 = getDPS(dmg1, move1.DurationMs)
      const dps2 = getDPS(dmg2, move2.DurationMs)

      stuff.push({
        quick: move1.Name,
        charge: move2.Name,
        dps1,
        dps2,
        total: Number(dps1) + Number(dps2),
      })
    })
  })

  return stuff.sort((a, b) => a.total > b.total ? -1 : 1)[0]
}

console.log(
  bestMovesFor(process.argv[2] || 'flareon')
)
