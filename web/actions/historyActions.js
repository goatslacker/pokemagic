const alt = require('../alt')

const historyActions = alt.generateActions('HistoryActions', [
  'pokemonChecked',
])

module.exports = historyActions
