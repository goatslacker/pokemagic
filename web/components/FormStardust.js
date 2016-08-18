const B = require('react-bootstrap')
const DustToLevel = require('../../json/dust-to-level.json')
const Select = require('react-select')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')

const dustOptions = Object.keys(DustToLevel).map(x => ({ value: x, label: x }))
const logStardust = x => pokemonActions.changedStardust(x.value)

function FormStardust(props) {
  return (
    n(B.FormGroup, { controlId: 'dust' }, [
      n(B.ControlLabel, 'Stardust'),
      n(Select, {
        name: 'stardust-selector',
        value: props.stardust,
        options: dustOptions,
        onChange: logStardust,
      }),
    ])
  )
}

module.exports = FormStardust
