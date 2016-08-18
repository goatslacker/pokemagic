const B = require('react-bootstrap')
const MovesList = require('../../json/moves.json')
const Pokemon = require('../../json/pokemon.json')
const Select = require('react-select')
const n = require('../utils/n')
const moveActions = require('../actions/moveActions')
const bestMovesFor = require('../../src/best-moves')

const pokemonList = Pokemon.map(x => ({ value: x.name, label: x.name }))
const movesList = pokemonList.slice()
movesList.push.apply(
  movesList,
  MovesList.map(x => ({ value: x.Name, label: x.Name }))
)

const Mon = Pokemon.reduce((obj, mon) => {
  obj[mon.name] = mon.id
  return obj
}, {})

function sweetMoves(x) {
  if (Mon.hasOwnProperty(x.value)) {
    const best = bestMovesFor(x.value)
    const mon = Pokemon[Mon[x.value] - 1]
    moveActions.pokemonChanged([])
    moveActions.movesChanged(best)
  } else {
    moveActions.movesChanged([])
    moveActions.pokemonChanged(
      Pokemon.filter(mon => (
        mon.moves1.some(m => m.Name === x.value) ||
        mon.moves2.some(m => m.Name === x.value)
      )).map(x => x.name)
    )
  }
  moveActions.textChanged(x.value)
}

function Moves(props) {
  return (
    n(B.Row, [
      n(B.PageHeader, 'Moveset Information'),
      n(B.FormGroup, { controlId: 'moves' }, [
        n(B.ControlLabel, 'Moves'),
        n(Select, {
          inputProps: {
            autoCorrect: 'off',
            autoCapitalize: 'off',
            spellCheck: 'off',
          },
          name: 'move-selector',
          value: props.text,
          options: movesList,
          onChange: sweetMoves,
        }),
      ]),
      props.pokemon.length && (
        n(B.Panel, props.pokemon.map(mon => (
          n('img', {
            onClick: () => sweetMoves({ value: mon }),
            src: `images/${mon}.png`,
            height: 60,
            width: 60,
          })
        )))
      ) || undefined,
      props.moves.length && (
        n(B.Table, {
          bordered: true,
          hover: true,
          striped: true,
        }, [
          n('thead', [
            n('tr', [
              n('th', 'Quick Move'),
              n('th', 'Charge Move'),
              n('th', 'Combo DPS'),
            ]),
          ]),
          n('tbody', props.moves.map((move) => (
            n('tr', [
              n('td', move.quick.name),
              n('td', move.charge.name),
              n('td', move.dps),
            ])
          ))),
        ])
      ) || undefined,
    ])
  )
}

module.exports = Moves
