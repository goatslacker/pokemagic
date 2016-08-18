const B = require('react-bootstrap')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')

function FormPokemonLevel(props) {
  return (
    n(B.FormGroup, { controlId: 'level' }, [
      n(B.ControlLabel, 'Pokemon Level (optional)'),
      n(B.FormControl, {
        type: 'number',
        onChange: pokemonActions.changedLevel,
        value: props.level,
      }),
    ])
  )
}

module.exports = FormPokemonLevel
