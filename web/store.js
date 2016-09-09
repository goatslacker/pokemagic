const redux = require('redux')

const appraisal = require('./reducers/appraisal')
const calculator = require('./reducers/calculator')
const dex = require('./reducers/dex')

module.exports = redux.createStore(
  redux.combineReducers({
    appraisal,
    calculator,
    dex,
  })
)
