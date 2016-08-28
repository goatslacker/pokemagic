const React = require('react')
const n = require('./n')

function connect(Component, o) {
  return class ConnectedComponent extends React.Component {
    constructor() {
      super()

      this.stores = o.listenTo()
      this.subscriptions = []

      this.state = this.computeState()
    }

    computeState() {
      return Object.keys(this.stores).reduce((obj, key) => {
        const store = this.stores[key]
        obj[key] = store.getState()
        return obj
      }, {})
    }

    componentDidMount() {
      this.subscriptions = Object.keys(this.stores).map((key) => {
        return this.stores[key].subscribe(
          () => this.setState(this.computeState())
        )
      })
      o.componentDidMount && o.componentDidMount()
    }

    componentWillUnmount() {
      this.subscriptions.forEach(sub => sub.dispose())
      this.subscriptions = []
    }

    render() {
      return n(Component, o.getProps(this.state, this.props), this.props.children)
    }
  }
}

module.exports = connect
