const B = require('../utils/Lotus.react')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')

function FormPokemonLevel(props) {
  return (
    n(B.FormControl, { label: 'Pokemon Level (optional)' }, [
      n(B.Input, {
        type: 'number',
        onChange: pokemonActions.changedLevel,
        value: props.level,
      }),
    ])
  )
}

module.exports = FormPokemonLevel
