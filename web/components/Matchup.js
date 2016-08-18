const B = require('react-bootstrap')
const FormPokemonName = require('./FormPokemonName')
const idealMatchup = require('../../src/idealMatchup')
const n = require('../utils/n')

function Matchup(props) {
  const matchups = props.name ? idealMatchup(props.name) : []
  return (
    n(B.Row, [
      n(B.PageHeader, 'Ideal Matchup'),
      n(FormPokemonName, { name: props.name }),
      matchups.length && (
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
      ),
    ])
  )
}

module.exports = Matchup
