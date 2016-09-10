const actions = require('../actions')
const mergeState = require('../utils/mergeState')
const validateActions = require('../utils/validateActions')

const set = value => payload => ({ [value]: payload })

const getInitialState = () => ({
  attrs: {},
  ivRange: null,
  stat: null,
  team: null,
})

const appraisal = mergeState(getInitialState(), validateActions(actions, {
  TEAM_SELECTED: set('team'),

  APPRAISAL_IV_RANGE_SET: set('ivRange'),

  APPRAISAL_STAT_SET: set('stat'),

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
