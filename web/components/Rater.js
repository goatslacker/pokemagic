const B = require('react-bootstrap')
const FormPokemonLevel = require('./FormPokemonLevel')
const FormPokemonName = require('./FormPokemonName')
const FormStardust = require('./FormStardust')
const FormTrainerLevel = require('./FormTrainerLevel')
const Results = require('./Results')
const calculateValues = require('../utils/calculateValues')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')
const SearchHistoryContainer = require('../containers/SearchHistoryContainer')

function Rater(props) {
  if (props.results) return n(Results, props.results)

  return n(B.Row, [
    n(B.PageHeader, 'Pokemon Rater'),
    n(FormTrainerLevel, { trainerLevel: props.trainerLevel }),
    n(FormPokemonName, { name: props.name }),
    n(B.FormGroup, { controlId: 'cp' }, [
      n(B.ControlLabel, 'CP'),
      n(B.FormControl, {
        type: 'number',
        onChange: pokemonActions.changedCP,
        onClick: () => pokemonActions.changedCP({ currentTarget: { value: '' }}),
        value: props.cp,
      }),
    ]),
    n(B.FormGroup, { controlId: 'hp' }, [
      n(B.ControlLabel, 'HP'),
      n(B.FormControl, {
        type: 'number',
        onChange: pokemonActions.changedHP,
        onClick: () => pokemonActions.changedHP({ currentTarget: { value: '' }}),
        value: props.hp,
      }),
    ]),
    n(FormStardust, { stardust: props.stardust }),
    n(FormPokemonLevel, { level: props.level }),
    n(B.Button, { bsStyle: 'primary', onClick: () => calculateValues() }, 'Calculate'),
    n(B.Button, { onClick: pokemonActions.valuesReset }, 'Clear'),
    n(SearchHistoryContainer),
  ])
}

module.exports = Rater
