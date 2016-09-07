const alt = require('../alt')
const appraisalActions = require('../actions/appraisalActions')
const pokemonActions = require('../actions/pokemonActions')

class AppraisalStore extends alt.Store {
  constructor() {
    super()
    this.bindActions(appraisalActions)
    this.bindActions(pokemonActions)
    this.state = {
      attrs: {},
      ivRange: null,
      team: null,
    }
  }

  teamSelected(team) {
    this.setState({ team })
  }

  ivRangeSet(ivRange) {
    this.setState({ ivRange })
  }

  attrToggled(value) {
    const attrs = this.state.attrs

    if (attrs[value]) {
      delete attrs[value]
    } else {
      attrs[value] = 1
    }

    this.setState({ attrs })
  }

  resultsCalculated() {
    this._reset()
  }

  valuesReset() {
    this._reset()
  }

  _reset() {
    this.setState({ attrs: {}, ivRange: null, team: null })
  }
}

module.exports = alt.createStore('AppraisalStore', new AppraisalStore())
