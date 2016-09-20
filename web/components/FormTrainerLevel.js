const B = require('../utils/Lotus.react')
const n = require('../utils/n')
const redux = require('../redux')

function FormTrainerLevel(props) {
  return (
    n(B.FormControl, { label: 'Trainer Level' }, [
      n(B.Input, {
        type: 'number',
        onChange: ev => redux.dispatch.changedTrainerLevel(ev.currentTarget.value),
        value: props.trainerLevel,
      }),
    ])
  )
}

module.exports = FormTrainerLevel
