const magic = require('../src/magic')
const id = require('./utils/id')

const IV_RANGE = {
  great: [82, 100],
  good: [67, 81],
  bad: [51, 66],
  ugly: [0, 50],
}

const STAT_VALUES = {
  great: [15],
  good: [13, 14],
  bad: [8, 9, 10, 11, 12],
  ugly: [0, 1, 2, 3, 4, 5, 6, 7],
}

const calculateValues = state => ({
  name: state.name,
  cp: Number(state.cp),
  hp: Number(state.hp),
  stardust: Number(state.stardust),
  level: state.level ? Number(state.level) : null,
  attrs: Object.keys(state.attrs || {}),
  ivRange: IV_RANGE[state.ivRange],
  stat: STAT_VALUES[state.stat],
})

module.exports = {
  APPRAISAL_ATTR_TOGGLED: id,
  APPRAISAL_IV_RANGE_SET: id,
  APPRAISAL_STAT_SET: id,
  CHANGED_CP: id,
  CHANGED_HP: id,
  CHANGED_LEVEL: id,
  CHANGED_NAME: id,
  CHANGED_STARDUST: id,
  CHANGED_TRAINER_LEVEL: id,
  DEX_TEXT_CHANGED: id,
  RESULTS_CALCULATED: poke => (dispatch, getState) => {
    const payload = poke || getState().calculator

    try {
      const values = calculateValues(payload)
      const results = magic(values)

      dispatch({
        pokemon: {
          name: payload.name,
          cp: payload.cp,
          hp: payload.hp,
          stardust: payload.stardust,
        },
        results: results.asObject(),
      })
    } catch (err) {
      console.error(err)
      alert('Looks like there is a problem with the values you entered.')
      dispatch({ results: null })
    }
  },
  RESULTS_RESET: id,
  SEARCHES_LOADED: id,
  TEAM_SELECTED: id,
  VALUES_RESET: id,
}
