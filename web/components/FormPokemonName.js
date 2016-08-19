const B = require('../utils/Lotus.react')
const Pokemon = require('../../json/pokemon.json')
const Select = require('react-select')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')

const options = Pokemon.map(x => ({ label: x.name.replace(/_/g, ' '), value: x.name }))
const logName = x => pokemonActions.changedName(x && x.value)

function FormPokemonName(props) {
  return (
    n(B.FormControl, { label: 'Name' }, [
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
