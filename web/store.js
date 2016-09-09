const redux = require('redux')

const appraisal = require('./reducers/appraisal')
const calculator = require('./reducers/calculator')

module.exports = redux.createStore(
  redux.combineReducers({
    appraisal,
    calculator,
  })
)
