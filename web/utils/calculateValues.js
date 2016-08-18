const inventoryStore = require('../stores/InventoryStore')
const historyActions = require('../actions/historyActions')
const magic = require('../../src/magic')
const pokemonActions = require('../actions/pokemonActions')

function calculateValues(nextState) {
  const state = nextState || inventoryStore.getState()
  try {
    const values = {
      name: state.name,
      cp: Number(state.cp),
      hp: Number(state.hp),
      stardust: Number(state.stardust),
      level: state.level ? Number(state.level) : null,
      trainerLevel: Number(state.trainerLevel) || 27,
    }
    const results = magic(values)
    pokemonActions.resultsCalculated(results)
    historyActions.pokemonChecked({
      text: `${state.name} ${state.cp}CP`,
      values,
    })
  } catch (err) {
    console.error(err)
    alert('Looks like there is a problem with the values you entered.')
  }
}

module.exports = calculateValues
