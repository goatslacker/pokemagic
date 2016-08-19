const B = require('react-bootstrap')
const RR = require('react-router')
const ReactDOM = require('react-dom')
const Styles = require('./styles')
const alt = require('./alt')
const connect = require('./utils/connect')
const n = require('./utils/n')
const localforage = require('localforage')

const Matchup = require('./components/Matchup')
const Moves = require('./components/Moves')
const PowerUp = require('./components/PowerUp')
const Rater = require('./components/Rater')

const pokemonActions = require('./actions/pokemonActions')

const movesStore = require('./stores/MovesStore')
const inventoryStore = require('./stores/InventoryStore')

const ConnectedMoves = connect(Moves, {
  listenTo: () => ({ movesStore }),
  getProps: state => state.movesStore,
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

function Main(props) {
  return n('div', { style: Styles.main }, [
    n('div', { style: Styles.container }, [
      n('div', {
        className: 'container',
      }, props.children),
    ]),
    n('div', { style: Styles.menu }, [
      n(RR.Link, { style: Styles.link, to: '/' }, 'Rater'),
      n(RR.Link, { style: Styles.link, to: 'moves' }, 'Moves'),
      n(RR.Link, { style: Styles.link, to: 'power' }, 'PowerUp Cost'),
      n(RR.Link, { style: Styles.link, to: 'matchup' }, 'Matchup'),
    ]),
  ])
}

const Routes = n(RR.Router, { history: RR.browserHistory }, [
  n(RR.Route, { path: '/', component: Main }, [
    n(RR.IndexRoute, { component: ConnectedRater }),
    n(RR.Route, { path: 'moves', component: ConnectedMoves }),
    n(RR.Route, { path: 'power', component: ConnectedPowerUp }),
    n(RR.Route, { path: 'matchup', component: ConnectedMatchup }),
  ]),
])

localforage.getItem('pogoivcalc.searches').then((searches) => {
  if (searches) alt.load({ HistoryStore: { searches } })
})

localforage.getItem('pogoivcalc.trainerLevel').then((trainerLevel) => {
  if (trainerLevel) {
    localforage.setItem('pogoivcalc.trainerLevel', trainerLevel)
    pokemonActions.trainerLevelChanged(trainerLevel)
  }

  ReactDOM.render(
    Routes,
    document.querySelector('#app')
  )
})
