const $ = require('./utils/n')
const Dex = require('./components/Dex')
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default
const Pokemon = require('../json/pokemon.json')
const React = require('react')
const ReactDOM = require('react-dom')
const injectTapEventPlugin = require('react-tap-event-plugin')

injectTapEventPlugin()

ReactDOM.render(
  $(MuiThemeProvider, [
    $(Dex),
  ]),
  document.querySelector('#app')
)
