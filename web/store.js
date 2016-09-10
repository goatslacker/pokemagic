const redux = require('redux')

const appraisal = require('./reducers/appraisal')
const calculator = require('./reducers/calculator')
const dex = require('./reducers/dex')
const history = require('./reducers/history')

module.exports = redux.createStore(
  redux.combineReducers({
    appraisal,
    calculator,
    dex,
    history,
  })
)
