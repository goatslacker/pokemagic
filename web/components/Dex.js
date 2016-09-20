const B = require('../utils/Lotus.react')
const Matchup = require('./Matchup')
const MoveCombos = require('./MoveCombos')
const MovesList = require('../../json/moves.json')
const Pokemon = require('../../json/pokemon.json')
const Select = require('react-select')
const Styles = require('../styles')
const TypeBadge = require('./TypeBadge')
const analyzeBattleEffectiveness = require('../../src/analyzeBattleEffectiveness')
const bestMovesFor = require('../../src/best-moves')
const redux = require('../redux')
const n = require('../utils/n')
const ovRating = require('../utils/ovRating')

const Types = {}
const Mon = Pokemon.reduce((obj, mon) => {
  const type1 = mon.type1
  const type2 = mon.type2

  Types[type1] = type1
  if (type2) Types[type2] = type2

  obj[mon.name] = mon
  return obj
}, {})

const pokemonList = Pokemon.map(x => ({ label: x.name.replace(/_/g, ' '), value: x.name }))
const movesList = pokemonList.slice()
movesList.push.apply(
  movesList,
  MovesList.map(x => ({ label: x.Name.replace(/_/g, ' '), value: x.Name }))
)
const dexList = Object.keys(Types).map(x => ({ label: x, value: x })).concat(movesList)

const getType = mon => (
  [mon.type1, mon.type2]
    .filter(Boolean)
    .map(type => n(TypeBadge, { type }))
)

const cond = html => html || null

function Pokedex(props) {
  const family = Pokemon
    .filter(x => x.family === props.pokemon.family)
    .filter(x => x.name !== props.pokemon.name)


  return n('tr', [
    n('td', [
      n(B.View, { style: Styles.resultsRow }, [
        n(B.Image, {
          onClick: () => redux.dispatch.dexTextChanged(props.pokemon.name),
          src: `images/${props.pokemon.name}.png`,
          height: 60,
          width: 60,
        }),
        n(B.View, [getType(props.pokemon)]),
      ])
    ]),
    n('td', Math.round(ovRating(props.pokemon))),
    n('td', family.map(fam => n(B.Image, {
      onClick: () => redux.dispatch.dexTextChanged(fam.name),
      src: `images/${fam.name}.png`,
      height: 50,
      width: 50,
    }))),
  ])
}

function MovesInfo(props) {
  return n(B.View, [
    n(B.Text, { strong: true }, 'Moves'),
    n(B.Table, [
      n('thead', [
        n('tr', [
          n('th', 'Name'),
          n('th', 'Power'),
          n('th', 'Energy'),
          n('th', 'DPS'),
        ]),
      ]),
      n('tbody', props.moves.map(move => (
        n('tr', [
          n('td', move.Name),
          n('td', move.Power),
          n('td', move.EnergyDelta),
          n('td', (move.Power / (move.DurationMs / 1000)).toFixed(3)),
        ])
      ))),
    ]),
    n(B.Divider),
  ])
}

function Report(props) {
  const level = redux.store.getState().calculator.trainerLevel || 20
  const report = analyzeBattleEffectiveness({
    name: props.pokemon.name,
    level,
    IndAtk: 15,
    IndDef: 15,
    IndSta: 15,
  })

  return n(B.View, [
    n(B.Header, `${props.pokemon.name} vs Gym defenders`),
    n(B.Text, { strong: true }, 'Avg DPS'),
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
    n(B.Divider),
  ])
}

function PokemonTable(props) {
  return n(B.View, [
    n(B.Table, [
      n('thead', [
        n('tr', [
          n('th', 'Pokemon'),
          n('th', 'Overall'),
          n('th', 'Family'),
        ]),
      ]),
      n('tbody', props.pokemon.map(pokemon => n(Pokedex, { pokemon }))),
    ]),
    n(B.Divider),
  ])
}

function Dex(props) {
  return (
    n(B.View, [
      n(B.Header, 'Pokemon Database'),
      n(B.Text, 'Below you will find information on this Pokemon\'s movesets, how this Pokemon fares against others, and which Pokemon are most effective vs it.'),
      n(B.Divider),
      n(B.FormControl, { label: 'Pokemon Name or Move Name' }, [
        n(Select, {
          inputProps: {
            autoCorrect: 'off',
            autoCapitalize: 'off',
            spellCheck: 'off',
          },
          name: 'move-selector',
          value: props.text,
          options: dexList,
          onChange: ev => redux.dispatch.dexTextChanged(ev.value),
        }),
      ]),
      cond(Mon.hasOwnProperty(props.text) && (
        n(PokemonTable, { pokemon: [Mon[props.text]] })
      )),
      cond(props.moves.length && [
        cond(props.moves[0].Name && n(MovesInfo, { moves: props.moves })),
        cond(props.moves[0].quick && [
          n(B.View, [
            n(B.Text, { strong: true }, 'Possible Movesets'),
            n(MoveCombos, { moves: props.moves }),
            n(B.Divider),
          ])
        ]),
      ]),
      cond(props.moves.Name && n(MovesInfo, { moves: [props.moves] })),
      cond(props.pokemon.length && n(PokemonTable, { pokemon: props.pokemon })),
      Mon.hasOwnProperty(props.text) && n(B.View, [
        n(Matchup, { name: props.text }),
        n(B.Divider),
      ]),
      Mon.hasOwnProperty(props.text) && (
        n(Report, { pokemon: Mon[props.text] })
      ),
      n(B.H3, 'More Info'),
      n(B.Text, 'The tables above feature a combined DPS score for each possible move combination. The DPS is calculated based on neutral damage for a level 25 Pokemon with 10/10/10 IVs assuming that the Pokemon will be using their quick move constantly and their charge move immediately when it becomes available. STAB damage is taken into account as well as each move\'s animation time. You can also use this search to look up which Pokemon can learn a particular move.'),
    ])
  )
}

module.exports = Dex
