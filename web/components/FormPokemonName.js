const B = require('react-bootstrap')
const Pokemon = require('../../json/pokemon.json')
const Select = require('react-select')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')

const options = Pokemon.map(x => ({ value: x.name.replace(/_/g, ' '), label: x.name }))
const logName = x => pokemonActions.changedName(x.value)

function FormPokemonName(props) {
  return (
    n(B.FormGroup, { controlId: 'pokemon' }, [
      n(B.ControlLabel, 'Name'),
      n(Select, {
        inputProps: {
          autoCorrect: 'off',
          autoCapitalize: 'off',
          spellCheck: 'off',
        },
        name: 'pokemon-selector',
        value: props.name,
        options,
        onChange: logName,
      }),
    ])
  )
}

module.exports = FormPokemonName
