const B = require('../utils/Lotus.react')
const n = require('../utils/n')
const dispatchableActions = require('../dispatchableActions')

function FormTrainerLevel(props) {
  return (
    n(B.FormControl, { label: 'Trainer Level' }, [
      n(B.Input, {
        type: 'number',
        onChange: ev => dispatchableActions.changedTrainerLevel(ev.currentTarget.value),
        value: props.trainerLevel,
      }),
    ])
  )
}

module.exports = FormTrainerLevel
