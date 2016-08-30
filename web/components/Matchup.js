const B = require('../utils/Lotus.react')
const FormPokemonName = require('./FormPokemonName')
const idealMatchup = require('../../src/idealMatchup')
const n = require('../utils/n')

function Matchup(props) {
  const matchups = props.name ? idealMatchup.overall(props.name) : []
  return (
    n(B.View, [
      n(B.Header, 'Ideal Matchup'),
      n(B.Text, 'This is calculated based on the opposing Pokemon\'s type and assuming the opponent has the best possible moveset combination for their Pokemon. The results do not include legendaries. Pokemon type effectiveness and resistances are also taken into account.'),
      n('hr'),
      n(FormPokemonName, { name: props.name }),
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
            n('tr', [
              n('td', [
                n(B.Text, { strong: true }, value.name),
                n(B.Text, `${value.net.toFixed(3)} Net TTL`),
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

module.exports = Matchup
