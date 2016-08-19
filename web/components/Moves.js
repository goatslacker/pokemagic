const B = require('react-bootstrap')
const MovesList = require('../../json/moves.json')
const Pokemon = require('../../json/pokemon.json')
const Select = require('react-select')
const n = require('../utils/n')
const moveActions = require('../actions/moveActions')
const bestMovesFor = require('../../src/best-moves')

const pokemonList = Pokemon.map(x => ({ value: x.name.replace(/_/g, ' '), label: x.name }))
const movesList = pokemonList.slice()
movesList.push.apply(
  movesList,
  MovesList.map(x => ({ value: x.Name.replace(/_/g, ' '), label: x.Name }))
)

const Mon = Pokemon.reduce((obj, mon) => {
  obj[mon.name] = mon.id
  return obj
}, {})
const ObjMoves = MovesList.reduce((obj, move) => {
  obj[move.Name] = move
  return obj
}, {})

function sweetMoves(x) {
  console.log('@', x.value, ObjMoves)
  if (Mon.hasOwnProperty(x.value)) {
    const best = bestMovesFor(x.value)
    const mon = Pokemon[Mon[x.value] - 1]
    moveActions.pokemonChanged([])
    moveActions.movesChanged(best)
  } else if (ObjMoves.hasOwnProperty(x.value)) {
    moveActions.movesChanged(ObjMoves[x.value])
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
      n('p', 'Calculate the ideal combination movesets for your Pokemon. Featuring a combined DPS score for each possible move combination. The DPS is calculated assuming a Pokemon will be using their quick move constantly and their charge move immediately when it becomes available. STAB damage is taken into account as well as each move\'s animation time. You can also use this search to look up which Pokemon can learn a particular move.'),
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
      props.moves.Name && (
        n(B.Panel, [
          n('div', `Name: ${props.moves.Name}`),
          n('div', `Power: ${props.moves.Power}`),
          n('div', `Duration: ${(props.moves.DurationMs / 1000).toFixed(1)} seconds`),
          n('div', `DPS: ${(props.moves.Power / (props.moves.DurationMs / 1000)).toFixed(3)}`),
          n('div', `Energy: ${props.moves.EnergyDelta}`),
        ])
      ) || undefined,
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
    ])
  )
}

module.exports = Moves
