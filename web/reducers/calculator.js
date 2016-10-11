const mergeState = require('../utils/mergeState')
const localforage = require('localforage')

const getInitialState = () => ({
  attrs: {},
  cp: 2207,
  hp: 129,
  ivRange: null,
  level: 0,
  name: 'ARCANINE',
  results: null,
  stardust: 4000,
  stat: null,
  team: null,
})

const getEmptyState = () => ({
  attrs: {},
  cp: 0,
  hp: 0,
  ivRange: null,
  level: 0,
  name: '',
  results: null,
  stardust: '',
  stat: null,
  team: null,
})

const reducers = {
  APPRAISAL_ATTR_TOGGLED: mergeState((state, action) => {
    const value = action.payload
    const attrs = Object.assign({}, state.attrs)

    if (attrs[value]) {
      delete attrs[value]
    } else {
      attrs[value] = 1
    }

    return { attrs }
  }),

  APPRAISAL_IV_RANGE_SET: mergeState('ivRange'),
  APPRAISAL_STAT_SET: mergeState('stat'),
  CHANGED_CP: mergeState('cp'),
  CHANGED_HP: mergeState('hp'),
  CHANGED_LEVEL: mergeState('level'),
  CHANGED_NAME: mergeState('name'),
  CHANGED_STARDUST: mergeState('stardust'),

  RESULTS_CALCULATED: mergeState(
    (state, action) => ({ results: action.payload.results })
  ),

  RESULTS_RESET: mergeState(
    () => ({ results: null, ivRange: null, attrs: {}, stat: null })
  ),

  TEAM_SELECTED: mergeState((state, action) => {
    localforage.setItem('pogoivcalc.team', action.payload)
    return { team: action.payload }
  }),

  VALUES_RESET: mergeState(() => getEmptyState()),
}

exports.getInitialState = getInitialState
exports.reducers = reducers
