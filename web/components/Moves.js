const B = require('../utils/Lotus.react')
const MoveCombos = require('./MoveCombos')
const MovesList = require('../../json/moves.json')
const Pokemon = require('../../json/pokemon.json')
const Select = require('react-select')
const n = require('../utils/n')
const moveActions = require('../actions/moveActions')
const bestMovesFor = require('../../src/best-moves')

const pokemonList = Pokemon.map(x => ({ label: x.name.replace(/_/g, ' '), value: x.name }))
const movesList = pokemonList.slice()
movesList.push.apply(
  movesList,
  MovesList.map(x => ({ label: x.Name.replace(/_/g, ' '), value: x.Name }))
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
  if (!x) {
    moveActions.pokemonChanged([])
    moveActions.movesChanged([])
    moveActions.textChanged('')
    return
  }

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
    n(B.View, [
      n(B.Header, 'Moveset Information'),
      n(B.Text, 'Calculate the ideal combination movesets for your Pokemon.'),
      n('hr'),
      n(B.FormControl, { label: 'Moves' }, [
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
        n(MoveCombos, { moves: props.moves })
      ) || undefined,
      props.moves.Name && (
        n(B.Panel, [
          n(B.Text, `Name: ${props.moves.Name}`),
          n(B.Text, `Power: ${props.moves.Power}`),
          n(B.Text, `Duration: ${(props.moves.DurationMs / 1000).toFixed(1)} seconds`),
          n(B.Text, `DPS: ${(props.moves.Power / (props.moves.DurationMs / 1000)).toFixed(3)}`),
          n(B.Text, `Energy: ${props.moves.EnergyDelta}`),
        ])
      ) || undefined,
      props.pokemon.length && (
        n(B.Panel, props.pokemon.map(mon => (
          n(B.Image, {
            onClick: () => sweetMoves({ value: mon }),
            src: `images/${mon}.png`,
            height: 60,
            width: 60,
          })
        )))
      ) || undefined,
      n('hr'),
      n('h3', 'More Info'),
      n(B.Text, 'The tables above feature a combined DPS score for each possible move combination. The DPS is calculated assuming a Pokemon will be using their quick move constantly and their charge move immediately when it becomes available. STAB damage is taken into account as well as each move\'s animation time. You can also use this search to look up which Pokemon can learn a particular move.'),
    ])
  )
}

module.exports = Moves
