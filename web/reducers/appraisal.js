const actions = require('../actions')
const mergeState = require('../utils/mergeState')
const validateActions = require('../utils/validateActions')

const getInitialState = () => ({
  attrs: {},
  ivRange: null,
  team: null,
})

const appraisal = mergeState(getInitialState(), validateActions(actions, {
  TEAM_SELECTED: team => ({ team }),

  APPRAISAL_IV_RANGE_SET: ivRange => ({ ivRange }),

  APPRAISAL_ATTR_TOGGLED(value, state) {
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
}))

module.exports = appraisal
