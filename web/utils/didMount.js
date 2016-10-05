const React = require('react')

function didMount(f, Component) {
  return class extends React.Component {
    componentDidMount() {
      f(this.props, this.context)
    }

    render() {
      return React.createElement(Component, this.props)
    }
  }
}

module.exports = didMount
