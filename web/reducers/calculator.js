const set = require('../utils/set')

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

const reducers = {
  CHANGED_NAME: set('name'),
  CHANGED_CP: set('cp'),
  CHANGED_HP: set('hp'),
  CHANGED_STARDUST: set('stardust'),
  CHANGED_LEVEL: set('level'),
  CHANGED_TRAINER_LEVEL: set('trainerLevel'),
  RESULTS_CALCULATED: (state, action) => ({ results: action.payload.asObject() }),
  RESULTS_RESET: () => ({ results: null }),
  VALUES_RESET: () => getEmptyState(),
}

exports.getInitialState = getInitialState
exports.reducers = reducers
