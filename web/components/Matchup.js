const B = require('../utils/Lotus.react')
const idealMatchup = require('../../src/idealMatchup')
const liftState = require('../utils/liftState')
const n = require('../utils/n')

function Matchup(props) {
  const matchups = props.name ? idealMatchup.attacking(props.name) : []
  return (
    n(B.View, [
      n(B.Header, `${props.name} Defending`),
      n(B.View, { spacing: 'sm' }),
      matchups.length ? (
        n(B.Table, {
          border: true,
        }, [
          n('thead', [
            n('tr', [
              n('th', 'Name'),
              n('th', 'Moves'),
            ]),
          ]),
          n('tbody', matchups.map((value) => (
            props.removed[value.name] ? null : n('tr', {
              // Remove all of said pokemon from list
              onClick: () => {
                const removed = props.removed
                removed[value.name] = true
                props.setState({ removed })
              },
            }, [
              n('td', [
                n(B.Text, { strong: true }, value.name),
                n(B.Text, `${value.score.toFixed(3)} Opp TTL`),
              ]),
              n('td', [
                n(B.Text, value.quick),
                n(B.Text, value.charge),
              ]),
            ])
          ))),
        ])
      ) : undefined,
    ])
  )
}

module.exports = liftState({
  removed: {},
}, Matchup)
