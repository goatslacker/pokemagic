const actions = require('../actions')
const mergeState = require('../utils/mergeState')
const validateActions = require('../utils/validateActions')

const set = value => payload => ({ [value]: payload })

const getInitialState = () => ({
  searches: {},
})

const history = mergeState(getInitialState(), validateActions(actions, {
  // This method loads our searches from localstorage. If the searches were an
  // Array then they're converted into an Object.
  SEARCHES_LOADED(prevSearches, state) {
    if (!Array.isArray(prevSearches)) return { searches: prevSearches }

    const searches = prevSearches.reduce((obj, v) => {
      const key = JSON.stringify(v.values)
      obj[key] = v.values
      return obj
    }, {})

    // TODO this belongs elsewhere
    localforage.setItem('pogoivcalc.searches', searches)

    return { searches }
  },

  POKEMON_CHECKED(pokemon, state) {
    const searches = Object.assign({}, state.searches)

    const key = JSON.stringify(pokemon)

    // if the key already exists inside searches then we'll just return state
    // this should be a noop and == Alt's preventDefault
    if (searches.hasOwnProperty(key)) return state

    searches[key] = pokemon

    // TODO this belongs elsewhere
    localforage.setItem('pogoivcalc.searches', searches)

    return { searches }
  },

  MOVES_CHANGED: set('moves'),
  POKEMON_CHANGED: set('pokemon'),
  DEX_TEXT_CHANGED: set('text'),
}))

module.exports = history
