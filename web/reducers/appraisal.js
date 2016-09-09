const actions = require('../actions')

function mergeState(initialState, mergers) {
  return (state, action) => {
    if (state === undefined) return initialState
    if (mergers[action.type]) {
      return Object.assign(
        {},
        state,
        mergers[action.type](action.payload, state, action)
      )
    }
    return state
  }
}

function validateActionNames(actions, mergers) {
  const invalid = Object.keys(mergers).filter(x => !actions.hasOwnProperty(x))
  if (invalid.length) throw new ReferenceError(invalid.join(' '))
  return mergers
}

const getInitialState = () => ({
  attrs: {},
  ivRange: null,
  team: null,
})

const appraisal = mergeState(getInitialState(), validateActionNames(actions, {
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
