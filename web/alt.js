const Alt = require('./assets/alt.min')
const alt = new Alt()
const store = require('./store')

alt.subscribe(action => {
  const type = action.type
    .replace('/', '')
    .replace(/([a-z])([A-Z])/g, (_, b, c) => b + '_' + c)
    .toUpperCase()

  const meta = action.meta
  const payload = action.payload

  store.dispatch({ type, payload, meta })
})

module.exports = alt
