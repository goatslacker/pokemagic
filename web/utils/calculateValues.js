const historyActions = require('../actions/historyActions')
const magic = require('../../src/magic')
const dispatchableActions = require('../dispatchableActions')
const store = require('../store');

const IV_RANGE = {
  great: [82, 100],
  good: [67, 81],
  bad: [51, 66],
  ugly: [0, 50],
}

function calculateValues(nextState) {
  const storeState = store.getState()

  const state = nextState || storeState.calculator
  const appraisal = storeState.appraisal

  try {
    const values = {
      name: state.name,
      cp: Number(state.cp),
      hp: Number(state.hp),
      stardust: Number(state.stardust),
      level: state.level ? Number(state.level) : null,
      trainerLevel: Number(state.trainerLevel) || 38.5, // XXX hack until we start doing Math.min(trainerLevel + 1.5, 40)
      attrs: Object.keys(appraisal.attrs),
      ivRange: IV_RANGE[appraisal.ivRange],
    }
    const results = magic(values)
    dispatchableActions.resultsCalculated(results)
    historyActions.pokemonChecked(values)
  } catch (err) {
    console.error(err)
    alert('Looks like there is a problem with the values you entered.')
  }
}

module.exports = calculateValues
