const B = require('./utils/Lotus.react')
const RR = require('react-router')
const React = require('react')
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

function Link(props) {
  return n(B.View, {
    style: Styles.linkWrapper,
  }, [
    n(RR.IndexLink, {
      activeClassName: 'active',
      style: Styles.link,
      to: props.to,
    }, props.children),
  ])
}

const Links = [
  n(Link, { to: '/' }, 'Rater'),
  n(Link, { to: 'moves' }, 'Moves'),
  n(Link, { to: 'power' }, 'PowerUp'),
  n(Link, { to: 'matchup' }, 'Matchup'),
]

class Main extends React.Component {
  constructor() {
    super()
    this.state = { small: false }
  }

  componentDidMount() {
    if (window.innerWidth < 500) {
      this.setState({ small: true })
    }
  }

  componentWillReceiveProps() {
    // When entering routes, scroll the window to the top
    if (typeof document !== 'undefined') {
      const node = document.querySelector('.pm')
      if (node) node.scrollTop = 0
    }
  }

  render() {
    const Container = (
      n(B.View, { className: 'pm', spacing: 'lg', style: Styles.container }, [
        n(B.View, {
          className: 'container',
        }, this.props.children),
      ])
    )
    const Nav = (
      n(B.View, {
        className: 'nav',
        style: this.state.small ? Styles.menu : Styles.menuDesktop,
      }, Links)
    )

    const App = this.state.small
      ? [Container, Nav]
      : [Nav, Container]

    return n(B.View, {
      style: this.state.small ? Styles.main : Styles.mainDesktop,
    }, App)
  }
}

const Routes = n(RR.Router, { history: RR.hashHistory }, [
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
