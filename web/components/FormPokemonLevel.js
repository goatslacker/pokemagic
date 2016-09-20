const B = require('../utils/Lotus.react')
const n = require('../utils/n')
const redux = require('../redux')

function FormPokemonLevel(props) {
  return (
    n(B.FormControl, { label: 'Pokemon Level (optional)' }, [
      n(B.Input, {
        type: 'number',
        onChange: ev => redux.dispatch.changedLevel(ev.currentTarget.value),
        value: props.level,
      }),
    ])
  )
}

module.exports = FormPokemonLevel
