const B = require('../utils/Lotus.react')
const MoveCombos = require('./MoveCombos')
const MovesList = require('../../json/moves.json')
const Pokemon = require('../../json/pokemon.json')
const Select = require('react-select')
const n = require('../utils/n')
const moveActions = require('../actions/moveActions')
const bestMovesFor = require('../../src/best-moves')
const Styles = require('../styles')
const getEffectiveness = require('../../src/getTypeEffectiveness').getEffectiveness
const analyzeBattleEffectiveness = require('../../src/analyzeBattleEffectiveness')
const store = require('../store')

const pokemonList = Pokemon.map(x => ({ label: x.name.replace(/_/g, ' '), value: x.name }))
const movesList = pokemonList.slice()
movesList.push.apply(
  movesList,
  MovesList.map(x => ({ label: x.Name.replace(/_/g, ' '), value: x.Name }))
)

const Mon = Pokemon.reduce((obj, mon) => {
  obj[mon.name] = mon
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
    const mon = Pokemon[Mon[x.value].id - 1]
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

function Pokedex(props) {
  const types = [props.pokemon.type1, props.pokemon.type2]
    .filter(Boolean).join('/')
  const fx = getEffectiveness(props.pokemon)

  return n(B.View, [
    n(B.View, {
      style: Styles.dex,
    }, [
      n(B.View, [
        n(B.Image, { src: `images/${props.pokemon.name.toUpperCase()}.png`, height: 150, width: 150 }),
        n(B.Text, { strong: true, style: Styles.resultsRow }, types),
      ]),
      n(B.View, {
        style: Styles.baseStats,
      }, [
        n(B.View, { style: Styles.stat }, [
          n(B.Text, 'Attack'),
          n(B.Text, { strong: true }, props.pokemon.stats.attack),
        ]),
        n(B.View, { style: Styles.stat }, [
          n(B.Text, 'Defense'),
          n(B.Text, { strong: true }, props.pokemon.stats.defense),
        ]),
        n(B.View, { style: Styles.stat }, [
          n(B.Text, 'Stamina'),
          n(B.Text, { strong: true }, props.pokemon.stats.stamina),
        ]),
      ]),
    ]),
    n(B.View, { spacing: 'sm' }),
    n(B.Text, `Super Effective: ${fx.superEffective.join(', ')}`),
    n(B.Text, `Not Very Effective: ${fx.notEffective.join(', ')}`),
  ])
}

function Report(props) {
  const level = store.getState().calculator.trainerLevel || 20
  const report = analyzeBattleEffectiveness({
    name: props.pokemon.name,
    level,
    IndAtk: 15,
    IndDef: 15,
    IndSta: 15,
  })

  return n(B.View, [
    n(B.Text, { strong: true }, 'Avg DPS'),
    n(B.Text, { small: true }, `Level ${level} perfect IV ${props.pokemon.name}`),
    n(B.Panel, [
      n(B.Text, `Average DPS: ${report.bestAvgDPS.toFixed(3)}`),
      n(B.Text, `Average TTL: ${report.bestAvgTTL.toFixed(3)}`),
    ]),

    n(B.View, { spacing: 'sm' }),

    n(B.Text, { strong: true }, 'vs Table'),
    n(B.Table, [
      n('thead', [
        n('tr', [
          n('th', 'Pokemon'),
          n('th', 'DPS'),
          n('th', 'TTL'),
        ]),
      ]),
      n('tbody', Object.keys(report.breakdown).map(pokemonName => (
        n('tr', [
          n('td', pokemonName),
          n('td', report.breakdown[pokemonName].dps.toFixed(3)),
          n('td', report.breakdown[pokemonName].ttl.toFixed(3)),
        ])
      ))),
    ]),
  ])
}

function Dex(props) {
  return (
    n(B.View, [
      n(B.Header, 'Pokemon Data'),
      n('hr'),
      n(B.FormControl, { label: 'Pokemon Name or Move Name' }, [
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
      Mon.hasOwnProperty(props.text) && (
        n(B.View, [
          n(Pokedex, { pokemon: Mon[props.text] }),
          n('hr'),
        ])
      ),
      props.moves.length && (
        n(B.View, [
          n(B.Text, { strong: true }, 'Possible Movesets'),
          n(MoveCombos, { moves: props.moves })
        ])
      ) || undefined,
      props.moves.Name && (
        n(B.Panel, [
          n(B.Text, `Name: ${props.moves.Name}`),
          n(B.Text, `Power: ${props.moves.Power}`),
          n(B.Text, `Duration: ${(props.moves.DurationMs / 1000).toFixed(1)} seconds`),
          n(B.Text, `PPS: ${(props.moves.Power / (props.moves.DurationMs / 1000)).toFixed(3)}`),
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
      Mon.hasOwnProperty(props.text) && (
        n(B.View, [
          n(Report, { pokemon: Mon[props.text] }),
          n('hr'),
        ])
      ),
      n('h3', 'More Info'),
      n(B.Text, 'The tables above feature a combined DPS score for each possible move combination. The DPS is calculated based on neutral damage for a level 25 Pokemon with 10/10/10 IVs assuming that the Pokemon will be using their quick move constantly and their charge move immediately when it becomes available. STAB damage is taken into account as well as each move\'s animation time. You can also use this search to look up which Pokemon can learn a particular move.'),
    ])
  )
}

module.exports = Dex
