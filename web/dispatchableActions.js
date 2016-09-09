const actions = require('./actions')
const redux = require('redux')
const store = require('./store')

module.exports = redux.bindActionCreators(actions, store.dispatch)
