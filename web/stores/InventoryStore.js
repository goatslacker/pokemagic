const alt = require('../alt')
const pokemonActions = require('../actions/pokemonActions')

class InventoryStore extends alt.Store {
  constructor() {
    super()
    this.bindActions(pokemonActions)
    this.state = {
      name: 'ARCANINE',
      cp: 2207,
      hp: 129,
      stardust: 4000,
      trainerLevel: 28,
      level: 0,
      results: null,
      processingImage: false,
    }
  }

  fromEvent(ev) {
    return ev.currentTarget.value
  }

  changedName(name) {
    this.setState({ name })
  }

  imageProcessing() {
    this.setState({ processingImage: true })
  }

  changedCP(ev) {
    const cp = this.fromEvent(ev)
    this.setState({ cp })
  }

  changedHP(ev) {
    const hp = this.fromEvent(ev)
    this.setState({ hp })
  }

  changedStardust(stardust) {
    this.setState({ stardust })
  }

  changedTrainerLevel(ev) {
    const trainerLevel = Number(this.fromEvent(ev))
    this.setState({ trainerLevel })
  }

  changedLevel(ev) {
    const level = this.fromEvent(ev)
    this.setState({ level })
  }

  resultsCalculated(results) {
    this.setState({ results: results.asObject() })
  }

  trainerLevelChanged(trainerLevel) {
    this.setState({ trainerLevel })
  }

  valuesReset() {
    this.setState({
      name: '',
      cp: 0,
      hp: 0,
      stardust: '',
      level: 0,
      results: null,
      processingImage: false,
    })
  }

  resultsReset() {
    this.setState({ results: null })
  }
}

module.exports = alt.createStore('InventoryStore', new InventoryStore())
