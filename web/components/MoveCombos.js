const B = require('../utils/Lotus.react')
const n = require('../utils/n')

function MoveCombos(props) {
  return (
    n(B.View, [
      n(B.View, {
        style: {
          display: 'flex',
          justifyContent: 'center',
        },
      }, [
        n(B.View, {
          style: {
            backgroundColor: '#f1d4d4',
            border: '1px solid #353535',
            borderRadius: 4,
            marginRight: '0.5em',
            height: '1em',
            width: '2em',
          },
        }),
        n(B.Text, 'combo is no longer available'),
      ]),
      n(B.Table, [
        n('thead', [
          n('tr', [
            n('th', 'Moves'),
            n('th', 'Combo DPS'),
          ]),
        ]),
        n('tbody', props.moves.map((move) => (
          n('tr', {
            style: {
              backgroundColor: move.retired ? '#f1d4d4' : 'inherit',
            },
            onClick: () => {
              if (props.onSelect) props.onSelect(move)
            },
          }, [
            n('td', [
              n(B.Text, move.quick.name),
              n(B.Text, move.charge.name),
            ]),
            n('td', move.dps.toFixed(3)),
          ])
        ))),
      ])
    ])
  )
}

module.exports = MoveCombos
