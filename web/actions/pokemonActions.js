const alt = require('../alt')

module.exports = alt.generateActions('InventoryActions', [
  'changedName',
  'changedCP',
  'changedHP',
  'changedStardust',
  'changedLevel',
  'changedTrainerLevel',
  'imageProcessing',
  'resultsCalculated',
  'resultsReset',
  'trainerLevelChanged',
  'valuesReset',
])
