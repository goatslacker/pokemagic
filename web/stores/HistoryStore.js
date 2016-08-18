const alt = require('../alt')
const historyActions = require('../actions/historyActions')
const localforage = require('localforage')

class HistoryStore extends alt.Store {
  constructor() {
    super()
    this.state = {
      searches: []
    }
    this.bindActions(historyActions)
  }

  pokemonChecked(pokemon) {
    const searches = []

    searches.push(pokemon)

    const inSearch = {
      [pokemon.text]: 1,
    }
    this.state.searches.forEach((mon) => {
      // make sure there are no dupes
      if (inSearch.hasOwnProperty(mon.text)) return
      // max 10 recent searches
      if (searches.length === 10) return

      searches.push(mon)
      inSearch[mon.text] = 1
    })

    this.setState({ searches })
    localforage.setItem('pogoivcalc.searches', searches)
  }
}

module.exports = alt.createStore('HistoryStore', new HistoryStore())
