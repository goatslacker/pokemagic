const alt = require('../alt')

const moveActions = alt.generateActions('MoveActions', [
  'movesChanged',
  'pokemonChanged',
  'textChanged',
])

module.exports = moveActions
