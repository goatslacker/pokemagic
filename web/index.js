const B = require('react-bootstrap')
const ReactDOM = require('react-dom')
const alt = require('./alt')
const connect = require('./utils/connect')
const n = require('./utils/n')
const localforage = require('localforage')

const Matchup = require('./components/Matchup')
const Moves = require('./components/Moves')
const PowerUp = require('./components/PowerUp')
const Rater = require('./components/Rater')
const SearchHistory = require('./components/SearchHistory')

const pokemonActions = require('./actions/pokemonActions')

const movesStore = require('./stores/MovesStore')
const historyStore = require('./stores/HistoryStore')
const inventoryStore = require('./stores/InventoryStore')

const ConnectedMoves = connect(Moves, {
  listenTo: () => ({ movesStore }),
  getProps: state => state.movesStore,
})

const ConnectedSearchHistory = connect(SearchHistory, {
  listenTo: () => ({ historyStore }),
  getProps: state => state.historyStore,
})

const ConnectedPowerUp = connect(PowerUp, {
  // TODO split inventoryStore and use pokemonStore or playerStore
  listenTo: () => ({ inventoryStore }),
  getProps: state => state.inventoryStore,
})

const ConnectedMatchup = connect(Matchup, {
  listenTo: () => ({ inventoryStore }),
  getProps: state => state.inventoryStore,
})

const ConnectedRater = connect(Rater, {
  listenTo: () => ({ inventoryStore }),
  getProps: state => state.inventoryStore,
})

// TODO use a router so we can have URLs
function Main() {
  const state = inventoryStore.getState()
  return n('div', { className: 'container' }, [
    n(ConnectedRater),
    state.results || (
      n('div', [
        n(ConnectedSearchHistory),
        n(ConnectedMoves),
        n(ConnectedPowerUp),
        n(ConnectedMatchup),
      ])
    ),
  ])
}

localforage.getItem('pogoivcalc.searches').then((searches) => {
  if (searches) alt.load({ HistoryStore: { searches } })
})

localforage.getItem('pogoivcalc.trainerLevel').then((trainerLevel) => {
  if (trainerLevel) {
    localforage.setItem('pogoivcalc.trainerLevel', trainerLevel)
    pokemonActions.trainerLevelChanged(trainerLevel)
  }

  ReactDOM.render(
    n(Main),
    document.querySelector('#app')
  )
})
