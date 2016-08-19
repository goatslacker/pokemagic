const B = require('../utils/Lotus.React')
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

  return n(B.View, [
    n(FormTrainerLevel, { trainerLevel: props.trainerLevel }),
    n(FormPokemonName, { name: props.name }),
    n(B.FormControl, { label: 'CP' }, [
      n(B.Input, {
        type: 'number',
        onChange: pokemonActions.changedCP,
        onClick: () => pokemonActions.changedCP({ currentTarget: { value: '' }}),
        value: props.cp,
      }),
    ]),
    n(B.FormControl, { label: 'HP' }, [
      n(B.Input, {
        type: 'number',
        onChange: pokemonActions.changedHP,
        onClick: () => pokemonActions.changedHP({ currentTarget: { value: '' }}),
        value: props.hp,
      }),
    ]),
    n(FormStardust, { stardust: props.stardust }),
    n(FormPokemonLevel, { level: props.level }),
    n(B.Button, {
      size: 'sm',
      onClick: () => calculateValues(),
      style: {
        backgroundColor: '#6297de',
      },
    }, 'Calculate'),
    ' ',
    n(B.Button, { size: 'sm', onClick: pokemonActions.valuesReset }, 'Clear'),
    n('hr'),
    n(SearchHistoryContainer),
  ])
}

module.exports = Rater
