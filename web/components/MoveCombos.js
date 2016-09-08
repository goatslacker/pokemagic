const B = require('../utils/Lotus.react')
const n = require('../utils/n')

function MovesTable(props) {
  return (
    n(B.Table, [
      n('thead', [
        n('tr', [
          n('th', 'Moves'),
          n('th', 'Combo DPS'),
        ]),
      ]),
      n('tbody', props.moves.map((move) => (
        n('tr', {
          onClick: () => {
            if (props.onSelect) props.onSelect(move)
          },
        }, [
          n('td', [
            n(B.Text, move.quick.name),
            n(B.Text, move.charge.name),
          ]),
          n('td', {
            style: {
              color: move.percent.dps > 74
                ? '#67ba72'
                : move.percent.dps > 50
                ? '#ddbb45'
                : '#ff7772'
            },
          }, `${move.dps.toFixed(3)} (${move.percent.dps}%)`),
        ])
      ))),
    ])
  )
}

function MoveCombos(props) {
  const possible = props.moves.filter(move => !move.retired)
  const retired = props.moves.filter(move => move.retired)
  const onSelect = props.onSelect

  return (
    n(B.View, [
      MovesTable({ moves: possible, onSelect }),
      retired.length && (
        n(B.View, [
          n(B.View, { spacing: 'sm' }),
          n(B.Text, { strong: true }, 'Retired'),
          MovesTable({ moves: retired, onSelect }),
        ])
      ) || undefined,
    ])
  )
}

module.exports = MoveCombos
