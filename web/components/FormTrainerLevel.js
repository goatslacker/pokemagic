const B = require('react-bootstrap')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')

function FormTrainerLevel(props) {
  return (
    n(B.FormGroup, { controlId: 'trainerlevel' }, [
      n(B.ControlLabel, 'Trainer Level'),
      n(B.FormControl, {
        type: 'number',
        onChange: pokemonActions.changedTrainerLevel,
        value: props.trainerLevel,
      }),
    ])
  )
}

module.exports = FormTrainerLevel
