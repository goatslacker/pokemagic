const deux = require('./utils/deux')
const actions = require('./actions')
const reducers = require('./reducers')

module.exports = deux(actions, reducers)
