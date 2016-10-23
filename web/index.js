const B = require('./utils/Lotus.react')
const React = require('react')
const ReactDOM = require('react-dom')
const Styles = require('./styles')
const n = require('./utils/n')
const localforage = require('localforage')
const scrollTop = require('./utils/scrollTop')
const SwipeableViews = require('react-swipeable-views').default
const reactRedux = require('react-redux')

const Dex = require('./components/Dex')
const PowerUp = require('./components/PowerUp')
const Rater = require('./components/Rater')

const redux = require('./redux')

const PowerUpContainer = reactRedux.connect(state => state.powerup)(PowerUp)
const RaterContainer = reactRedux.connect(state => state.calculator)(Rater)
const DexContainer = reactRedux.connect(state => state.dex)(Dex)

function hashChanged() {
  const arr = window.location.hash.split('/')

  if (arr[1] === 'iv') {
    if (arr[2]) redux.dispatch.changedName(arr[2].toUpperCase())
    if (arr[3]) redux.dispatch.changedCp(Number(arr[3]))
    if (arr[4]) redux.dispatch.changedHp(Number(arr[4]))
    if (arr[5]) redux.dispatch.changedStardust(Number(arr[5]))
    if (arr.length === 6) redux.dispatch.resultsCalulated()
  } else if (arr[1] === 'dex') {
    redux.dispatch.dexTextChanged(arr[2].toUpperCase())
  }
}

class Main extends React.Component {
  componentDidMount() {
    hashChanged()
    window.onhashchange = () => hashChanged()
  }

  render() {
    const Container = n(RaterContainer)

    return n(B.View, {
      style: Styles.mainDesktop,
    }, [Container])
  }
}

localforage.getItem('pogoivcalc.searches').then((searches) => {
  if (searches) redux.dispatch.searchesLoaded(searches)
})

ReactDOM.render(
  n(reactRedux.Provider, { store: redux.store }, [n(Main)]),
  document.querySelector('#app')
)
