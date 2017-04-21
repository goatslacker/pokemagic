const avgComboDPS = require('./avgComboDPS')

const goodFor = poke => {
  const defenders = {}
  poke.moves.combo.forEach((move) => {
    const info = avgComboDPS(poke, move.A, move.B)
    info.meta.goodAgainst.forEach(opp => {
      if (defenders[opp.name]) {
        defenders[opp.name].score += opp.score
      } else {
        defenders[opp.name] = opp
      }
    })
  })

  return Object.keys(defenders)
    .map(k => defenders[k])
    .sort((a, b) => a.score > b.score ? -1 : 1)
    .slice(0, 10)
}

module.exports = goodFor

//const Pokemon = require('../json/pokemon')
//console.log(
//  goodFor(Pokemon.filter(x => x.name === 'EXEGGUTOR')[0]).map(x => x.name)
//)
