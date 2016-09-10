const B = require('./utils/Lotus.react')
const React = require('react')
const ReactDOM = require('react-dom')
const Styles = require('./styles')
const connect = require('./utils/connect')
const n = require('./utils/n')
const localforage = require('localforage')
const scrollTop = require('./utils/scrollTop')
const SwipeableViews = require('react-swipeable-views').default
const reactRedux = require('react-redux')

const Dex = require('./components/Dex')
const Matchup = require('./components/Matchup')
const PowerUp = require('./components/PowerUp')
const Rater = require('./components/Rater')

const dispatchableActions = require('./dispatchableActions')

const reduxStore = require('./store')

const calculateValues = require('./utils/calculateValues')

// TODO make powerup and matchup use different reducers
const PowerUpContainer = reactRedux.connect(state => state.calculator)(PowerUp)
const MatchupContainer = reactRedux.connect(state => state.calculator)(Matchup)
const RaterContainer = reactRedux.connect(state => state.calculator)(Rater)
const DexContainer = reactRedux.connect(state => state.dex)(Dex)

function hashChanged(self) {
  const arr = window.location.hash.split('/')

  if (arr[1] === 'iv') {
    self.setState({ selectedSlide: 0 })
    if (arr[2]) dispatchableActions.changedName(arr[2].toUpperCase())
    if (arr[3]) dispatchableActions.changedCP(Number(arr[3]))
    if (arr[4]) dispatchableActions.changedHP(Number(arr[4]))
    if (arr[5]) dispatchableActions.changedStardust(Number(arr[5]))
    if (arr.length === 6) calculateValues()
  } else if (arr[1] === 'dex') {
    self.setState({ selectedSlide: 1 })
    dispatchableActions.dexTextChanged(arr[2].toUpperCase())
  }
}

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

    hashChanged(this)
    window.onhashchange = () => hashChanged(this)
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
      n(RaterContainer),
      n(DexContainer),
      n(PowerUpContainer),
      n(MatchupContainer),
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
  if (searches) dispatchableActions.searchesLoaded(searches)
})

localforage.getItem('pogoivcalc.trainerLevel').then((trainerLevel) => {
  // TODO ask for trainerLevel later...
//  if (trainerLevel) {
//    localforage.setItem('pogoivcalc.trainerLevel', trainerLevel)
//    pokemonActions.trainerLevelChanged(trainerLevel)
//  }

  ReactDOM.render(
    n(reactRedux.Provider, { store: reduxStore }, [n(Main)]),
    document.querySelector('#app')
  )
})
