const B = require('../utils/Lotus.react')
const DustToLevel = require('../../json/dust-to-level.json')
const Select = require('react-select')
const n = require('../utils/n')
const dispatchableActions = require('../dispatchableActions')

const dustOptions = Object.keys(DustToLevel)
  .map(x => ({ value: Number(x), label: Number(x) }))
const logStardust = x => dispatchableActions.changedStardust(x && x.value)

function FormStardust(props) {
  return (
    n(B.FormControl, { label: 'Stardust' }, [
      n(Select, {
        name: 'stardust-selector',
        value: props.stardust,
        options: dustOptions,
        inputProps: {
          type: 'number',
        },
        onChange: logStardust,
      }),
    ])
  )
}

module.exports = FormStardust
