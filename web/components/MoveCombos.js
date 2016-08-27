const B = require('../utils/Lotus.react')
const n = require('../utils/n')

function MoveCombos(props) {
  return (
    n(B.Table, [
      n('thead', [
        n('tr', [
          n('th', 'Moves'),
          n('th', 'Combo DPS'),
        ]),
      ]),
      n('tbody', props.moves.map((move) => (
        n('tr', [
          n('td', [
            n(B.Text, move.quick.name),
            n(B.Text, move.charge.name),
          ]),
          n('td', move.dps.toFixed(3)),
        ])
      ))),
    ])
  )
}

module.exports = MoveCombos
