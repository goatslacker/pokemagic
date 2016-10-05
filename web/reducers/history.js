const localforage = require('localforage')
const set = require('../utils/set')

exports.getInitialState = () => ({
  searches: {},
})

exports.reducers = {
  // This method loads our searches from localstorage. If the searches were an
  // Array then they're converted into an Object.
  SEARCHES_LOADED(state, action) {
    const prevSearches = action.payload
    if (!Array.isArray(prevSearches)) return { searches: prevSearches }

    const searches = prevSearches.reduce((obj, v) => {
      const key = JSON.stringify(v.values)
      obj[key] = v.values
      return obj
    }, {})

    localforage.setItem('pogoivcalc.searches', searches)

    return { searches }
  },

  RESULTS_CALCULATED(state, action) {
    if (!action.payload.results) return state

    const pokemon = action.payload.pokemon
    const key = JSON.stringify(pokemon)

    const searches = Object.assign({}, state.searches)

    // if the key already exists inside searches then we'll just return state
    // this should be a noop and == Alt's preventDefault
    if (searches.hasOwnProperty(key)) return state

    searches[key] = pokemon

    // TODO this belongs elsewhere
    // maybe i should add a hook that listens to state changes and sets localstorage
    localforage.setItem('pogoivcalc.searches', searches)

    return { searches }
  },
}
