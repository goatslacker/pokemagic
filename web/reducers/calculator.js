const actions = require('../actions')
const mergeState = require('../utils/mergeState')
const validateActions = require('../utils/validateActions')

const set = value => payload => ({ [value]: payload })

const getInitialState = () => ({
  name: 'ARCANINE',
  cp: 2207,
  hp: 129,
  stardust: 4000,
  trainerLevel: '',
  level: 0,
  results: null,
})

const getEmptyState = () => ({
  name: '',
  cp: 0,
  hp: 0,
  stardust: '',
  level: 0,
  results: null,
})

const calculator = mergeState(getInitialState(), validateActions(actions, {
  CHANGED_NAME: set('name'),
  CHANGED_CP: set('cp'),
  CHANGED_HP: set('hp'),
  CHANGED_STARDUST: set('stardust'),
  CHANGED_LEVEL: set('level'),
  CHANGED_TRAINER_LEVEL: set('trainerLevel'),
  RESULTS_CALCULATED: ivResults => ({ results: ivResults.asObject() }),
  RESULTS_RESET: () => ({ results: null }),
  VALUES_RESET: () => getEmptyState(),
}))

module.exports = calculator
