const actions = require('../actions')

// XXX how about some higher order functions for redux?!
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

const calculator = mergeState(getInitialState(), validateActionNames(actions, {
  CHANGED_NAME: name => ({ name }),
  CHANGED_CP: cp => ({ cp }),
  CHANGED_HP: hp => ({ hp }),
  CHANGED_STARDUST: stardust => ({ stardust }),
  CHANGED_LEVEL: level => ({ level }),
  CHANGED_TRAINER_LEVEL: trainerLevel => ({ trainerLevel }),
  RESULTS_CALCULATED: ivResults => ({ results: ivResults.asObject() }),
  RESULTS_RESET: () => ({ results: null }),
  VALUES_RESET: () => getEmptyState(),
}))

module.exports = calculator
