const B = require('../utils/Lotus.react')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')

function FormTrainerLevel(props) {
  return (
    n(B.FormControl, { label: 'Trainer Level' }, [
      n(B.Input, {
        type: 'number',
        onChange: pokemonActions.changedTrainerLevel,
        value: props.trainerLevel,
      }),
    ])
  )
}

module.exports = FormTrainerLevel
