const B = require('./utils/Lotus.react')
const React = require('react')
const ReactDOM = require('react-dom')
const Styles = require('./styles')
const alt = require('./alt')
const connect = require('./utils/connect')
const n = require('./utils/n')
const localforage = require('localforage')
const scrollTop = require('./utils/scrollTop')
const SwipeableViews = require('react-swipeable-views').default

const Dex = require('./components/Dex')
const Matchup = require('./components/Matchup')
const PowerUp = require('./components/PowerUp')
const Rater = require('./components/Rater')

const pokemonActions = require('./actions/pokemonActions')

const movesStore = require('./stores/MovesStore')
const inventoryStore = require('./stores/InventoryStore')

const calculateValues = require('./utils/calculateValues')

const ConnectedDex = connect(Dex, {
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
  componentDidMount() {
    const arr = window.location.hash.split('/')

    function toEv(value) {
      return { currentTarget: { value } }
    }

    if (arr[1]) pokemonActions.changedName(arr[1].toUpperCase())
    if (arr[2]) pokemonActions.changedCP(toEv(Number(arr[2])))
    if (arr[3]) pokemonActions.changedHP(toEv(Number(arr[3])))
    if (arr[4]) pokemonActions.changedStardust(Number(arr[4]))

    if (arr.length === 5) calculateValues()
  },
})

class Main extends React.Component {
  constructor() {
    super()
    this.state = {
      small: false,
      selectedSlide: 0,
    }
  }

  componentDidMount() {
    if (window.innerWidth < 500) {
      this.setState({ small: true })
    }
  }

  renderNav() {
    return (
      n(B.View, {
        className: 'nav',
        style: this.state.small ? Styles.menu : Styles.menuDesktop,
      }, [
        this.renderLink(0, 'Rater'),
        this.renderLink(1, 'Dex'),
        this.renderLink(2, 'PowerUp'),
        this.renderLink(3, 'Matchup'),
      ])
    )
  }

  renderLink(selectedSlide, text) {
    return n(B.View, {
      style: Styles.linkWrapper,
    }, [
      n(B.Link, {
        className: this.state.selectedSlide === selectedSlide ? 'active' : '',
        onClick: () => {
          this.setState({ selectedSlide })
          scrollTop()
        },
        style: Styles.link,
      }, text),
    ])
  }

  render() {
    const Slides = [
      n(ConnectedRater),
      n(ConnectedDex),
      n(ConnectedPowerUp),
      n(ConnectedMatchup),
    ]

    const Nav = this.renderNav()

    const Container = (
      n(SwipeableViews, {
        animateTransitions: this.state.small,
        className: 'pm',
        index: this.state.selectedSlide,
        onChangeIndex: (selectedSlide) => {
          this.setState({ selectedSlide })
          scrollTop()
        },
        resistance: true,
        style: Styles.container,
      }, Slides.map(slide => (
        n(B.View, { spacing: 'lg' }, [slide])
      )))
    )

    if (this.state.small) {
      return n(B.View, {
        style: Styles.main,
      }, [Container, Nav])
    }

    return n(B.View, {
      style: Styles.mainDesktop,
    }, [Nav, Container])
  }
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
