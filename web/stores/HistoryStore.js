const alt = require('../alt')
const historyActions = require('../actions/historyActions')
const localforage = require('localforage')

class HistoryStore extends alt.Store {
  constructor() {
    super()
    this.state = {
      searches: {}
    }
    this.bindActions(historyActions)

    this.on('load', (payload) => {
      if (Array.isArray(payload.state.searches)) {
        this.compatibilityCheck(payload.state.searches)
      }
    })
  }

  // This method turns our searches Array into an object if one exists
  // already in localStorage
  compatibilityCheck(prevSearches) {
    const searches = prevSearches.reduce((obj, v) => {
      const key = JSON.stringify(v.values)
      obj[key] = v.values
      return obj
    }, {})

    this.setState({ searches })
  }

  pokemonChecked(pokemon) {
    const searches = this.state.searches

    const key = JSON.stringify(pokemon)

    if (searches.hasOwnProperty(key)) return this.preventDefault()

    searches[key] = pokemon

    this.setState({ searches })
    localforage.setItem('pogoivcalc.searches', searches)
  }
}

module.exports = alt.createStore('HistoryStore', new HistoryStore())
