const magic = require('../src/magic')

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

exports.types = [
  'APPRAISAL_ATTR_TOGGLED',
  'APPRAISAL_IV_RANGE_SET',
  'APPRAISAL_STAT_SET',
  'CHANGED_CP',
  'CHANGED_HP',
  'CHANGED_LEVEL',
  'CHANGED_NAME',
  'CHANGED_STARDUST',
  'CHANGED_TRAINER_LEVEL',
  'DEX_TEXT_CHANGED',
  'RESULTS_RESET',
  'SEARCHES_LOADED',
  'TEAM_SELECTED',
  'VALUES_RESET',
]

exports.asyncTypes = {
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
}
