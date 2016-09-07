const React = require('react')

function liftState(state, Component) {
  return class extends React.Component {
    constructor() {
      super()
      this.state = state
    }

    render() {
      return React.createElement(Component, Object.assign({
        setState: nextState => this.setState(nextState),
      }, this.props, this.state))
    }
  }
}

module.exports = liftState
