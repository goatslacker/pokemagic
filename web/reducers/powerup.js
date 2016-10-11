const mergeState = require('../utils/mergeState')

const getInitialState = () => ({
  trainerLevel: 30,
  level: 0,
  stardust: 4000,
})

const reducers = {
  CHANGED_LEVEL: mergeState('level'),
  CHANGED_TRAINER_LEVEL: mergeState('trainerLevel'),
  CHANGED_STARDUST: mergeState('stardust'),
}

exports.getInitialState = getInitialState
exports.reducers = reducers
