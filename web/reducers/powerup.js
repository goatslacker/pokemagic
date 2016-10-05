const set = require('../utils/set')

const getInitialState = () => ({
  trainerLevel: 30,
  level: 0,
  stardust: 4000,
})

const reducers = {
  CHANGED_LEVEL: set('level'),
  CHANGED_TRAINER_LEVEL: set('trainerLevel'),
  CHANGED_STARDUST: set('stardust'),
}

exports.getInitialState = getInitialState
exports.reducers = reducers
