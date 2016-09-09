const alt = require('../alt')

const moveActions = alt.generateActions('', [
  'movesChanged',
  'pokemonChanged',
  'textChanged',
])

module.exports = moveActions
