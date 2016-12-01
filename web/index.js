const $ = require('./utils/n')
const Dex = require('./components/Dex')
const MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default
const ReactDOM = require('react-dom')
const injectTapEventPlugin = require('react-tap-event-plugin')
//window.Perf = require('react-addons-perf')

injectTapEventPlugin()

ReactDOM.render(
  $(MuiThemeProvider, [
    $(Dex),
  ]),
  document.querySelector('#app')
)
