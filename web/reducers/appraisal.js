const set = require('../utils/set')

const getInitialState = () => ({
  attrs: {},
  ivRange: null,
  stat: null,
  team: null,
})

const reducers = {
  TEAM_SELECTED: set('team'),

  APPRAISAL_IV_RANGE_SET: set('ivRange'),

  APPRAISAL_STAT_SET: set('stat'),

  APPRAISAL_ATTR_TOGGLED(state, action) {
    const value = action.payload
    const attrs = Object.assign({}, state.attrs)

    if (attrs[value]) {
      delete attrs[value]
    } else {
      attrs[value] = 1
    }

    return { attrs }
  },

  RESULTS_CALCULATED: () => getInitialState(),

  VALUES_RESET: () => getInitialState(),
}

exports.getInitialState = getInitialState
exports.reducers = reducers
