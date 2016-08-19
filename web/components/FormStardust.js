const B = require('../utils/Lotus.react')
const DustToLevel = require('../../json/dust-to-level.json')
const Select = require('react-select')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')

const dustOptions = Object.keys(DustToLevel).map(x => ({ value: x, label: x }))
const logStardust = x => pokemonActions.changedStardust(x && x.value)

function FormStardust(props) {
  return (
    n(B.FormControl, { label: 'Stardust' }, [
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
