const B = require('react-bootstrap')
const FormPokemonName = require('./FormPokemonName')
const idealMatchup = require('../../src/idealMatchup')
const n = require('../utils/n')

function Matchup(props) {
  const matchups = props.name ? idealMatchup(props.name) : []
  return (
    n(B.Row, [
      n(B.PageHeader, 'Ideal Matchup'),
      n('p', 'This is calculated based on the opposing Pokemon\'s type and assuming the opponent has the best possible moveset combination for their Pokemon. The results do not include legendaries. Pokemon type effectiveness and resistances are also taken into account.'),
      n(FormPokemonName, { name: props.name }),
      matchups.length ? (
        n(B.Table, {
          bordered: true,
          hover: true,
          striped: true,
        }, [
          n('thead', [
            n('tr', [
              n('th', 'Name'),
              n('th', 'Quick Move'),
              n('th', 'Charge Move'),
            ]),
          ]),
          n('tbody', matchups.map((value) => (
            n('tr', [
              n('td', value.name),
              n('td', value.quick),
              n('td', value.charge),
            ])
          ))),
        ])
      ) : undefined,
    ])
  )
}

module.exports = Matchup
