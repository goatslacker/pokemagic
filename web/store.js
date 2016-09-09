const redux = require('redux')
const calculator = require('./reducers/calculator')

module.exports = redux.createStore(
  redux.combineReducers({
    calculator
  })
)
