const alt = require('../alt')
const moveActions = require('../actions/moveActions')

class MovesStore extends alt.Store {
  constructor() {
    super()
    this.state = {
      text: '',
      moves: [],
      pokemon: [],
    }
    this.bindActions(moveActions)
  }

  textChanged(text) {
    this.setState({ text })
  }

  movesChanged(moves) {
    this.setState({ moves })
  }

  pokemonChanged(pokemon) {
    this.setState({ pokemon })
  }
}

module.exports = alt.createStore('MovesStore', new MovesStore())
