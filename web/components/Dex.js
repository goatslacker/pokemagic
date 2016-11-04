const Appraisal = require('./Appraisal')
const B = require('../utils/Lotus.React')
const FormPokemonLevel = require('./FormPokemonLevel')
const FormPokemonName = require('./FormPokemonName')
const FormStardust = require('./FormStardust')
const Matchup = require('./Matchup')
const MoveCombos = require('./MoveCombos')
const MovesList = require('../../json/moves.json')
const Pokemon = require('../../json/pokemon.json')
const Results = require('./Results')
const Select = require('react-select')
const Styles = require('../styles')
const TypeBadge = require('./TypeBadge')
const analyzeBattleEffectiveness = require('../../src/analyzeBattleEffectiveness')
const avgComboDPS = require('../../src/avgComboDPS')
const liftState = require('../utils/liftState')
const n = require('../utils/n')
const ovRating = require('../utils/ovRating')
const pokeRatings = require('../utils/pokeRatings').getRating
const reactRedux = require('react-redux')
const redux = require('../redux')
const { Card } = require('material-ui/Card')
const AppBar = require('material-ui/AppBar').default
const Chip = require('material-ui/Chip').default
const { Tabs, Tab } = require('material-ui/Tabs')
const Divider = require('material-ui/Divider').default
const IconButton = require('material-ui/IconButton').default
const SearchIcon = require('material-ui/svg-icons/action/search').default
const AutoComplete = require('material-ui/AutoComplete').default
const BackIcon = require('material-ui/svg-icons/navigation/arrow-back').default

function Rater(props) {
  if (props.results) return n(Results, props.results)

  return n(Card, [
    n(B.FormControl, { label: 'CP' }, [
      n(B.Input, {
        type: 'number',
        onChange: ev => redux.dispatch.changedCp(ev.currentTarget.value),
        onClick: () => redux.dispatch.changedCp(''),
        value: props.cp,
      }),
    ]),
    n(B.FormControl, { label: 'HP' }, [
      n(B.Input, {
        type: 'number',
        onChange: ev => redux.dispatch.changedHp(ev.currentTarget.value),
        onClick: () => redux.dispatch.changedHp(''),
        value: props.hp,
      }),
    ]),
    n(FormStardust, { stardust: props.stardust }),
//    n(Appraisal),
    n(B.Button, {
      size: 'sm',
      onClick: () => redux.dispatch.resultsCalculated(),
      style: {
        backgroundColor: '#6297de',
      },
    }, 'Calculate'),
    ' ',
    n(B.Button, { size: 'sm', onClick: redux.dispatch.valuesReset }, 'Clear'),
  ])
}

const RaterContainer = reactRedux.connect(state => state.calculator)(Rater)


const PokeMoves = Pokemon.reduce((pokes, poke) => {
  pokes[poke.name] = poke.moves1.reduce((obj, move1) => {
    return poke.moves2.reduce((o, move2) => {
      const info = avgComboDPS(poke, move1, move2)
      o[info.quick.name] = info.quick
      o[info.charge.name] = info.charge
      o[info.combo.name] = Object.assign({ meta: info.meta }, info.combo)
      return o
    }, obj)
  }, {})
  return pokes
}, {})

const max = (poke, n, f) => Math.max.apply(
  Math.max,
  [n].concat(
    Object.keys(PokeMoves[poke])
    .map(x => PokeMoves[poke][x])
    .filter(x => x.meta)
    .map(x => f(x))
  )
)

const min = (poke, n, f) => Math.min.apply(
  Math.min,
  [n].concat(
    Object.keys(PokeMoves[poke])
    .map(x => PokeMoves[poke][x])
    .filter(x => x.meta)
    .map(x => f(x))
  )
)

const PokeScale = Object.keys(PokeMoves).reduce((best, poke) => ({
  atk: {
    max: max(poke, best.atk.max, x => x.dps),
    min: min(poke, best.atk.min, x => x.dps),
  },
  def: {
    max: max(poke, best.def.max, x => x.gymDPS),
    min: min(poke, best.def.min, x => x.gymDPS),
  },
}), {
  atk: {
    max: -Infinity,
    min: Infinity,
  },
  def: {
    max: -Infinity,
    min: Infinity,
  },
})

const Moves = MovesList.reduce((moves, move) => {
  moves[move.Name] = move
  return moves
}, {})

const ucFirst = x => x ? x[0].toUpperCase() + x.slice(1).toLowerCase() : ''

const fixMoveName = moveName => (
  moveName
    .replace('_FAST', '')
    .toLowerCase()
    .split('_')
    .map(ucFirst)
    .join(' ')
)

const Types = {}
const Mon = Pokemon.reduce((obj, mon) => {
  const type1 = mon.type1
  const type2 = mon.type2

  Types[type1] = type1
  if (type2) Types[type2] = type2

  obj[mon.name] = mon
  return obj
}, {})


const getType = mon => (
  [mon.type1, mon.type2]
    .filter(Boolean)
    .map(type => n(TypeBadge, { type }))
)

const cond = html => html || null

const isStab = (pokemon, move) => (
  [pokemon.type1, pokemon.type2]
    .filter(Boolean)
    .filter(type => type === move.Type)
    .length > 0
)

const Badge = props => (
  n(Chip, props.text)
)

const Overall = ({ rate }) => (
  n(B.View, [
    n(Badge, {
//      color: 'chartreuse',
      text: `OVR ${rate.ovr}% ${rate.atk}/${rate.def}`,
    }),
  ])
)

const eps = move => (
  move.Energy / (move.DurationMs / 1000)
).toFixed(1)

const QuickMoveInfo = ({
  info,
  move,
  selected,
  setState,
  stab,
}) => (
  n(Card, [
    n(B.Link, {
      onClick: () => setState({ quick: move.Name }),
    }, fixMoveName(move.Name)),
    n(B.Text, { strong: stab }, ucFirst(move.Type)),
    n(B.Text, `DPS ${info.dps.toFixed(2)} | Gym ${info.gymDPS.toFixed(2)}`),
    n(B.Text, `${eps(move)} EPS`),
  ])
)

const dodge = move => (
  (Moves[move.Name].DamageWindowEndMs - Moves[move.Name].DamageWindowStartMs) / 1000
).toFixed(1)

const startTime = move => (Moves[move.Name].DamageWindowStartMs / 1000).toFixed(1)

const ChargeMoveInfo = ({
  info,
  move,
  selected,
  setState,
  stab,
}) => (
  n(Card, [
    n(B.Link, {
      onClick: () => setState({ charge: move.Name }),
    }, fixMoveName(move.Name)),
    n(B.Text, { strong: stab }, ucFirst(move.Type)),
    n(B.Text, `${info.dmg.toFixed(2)} DMG @ ${move.DurationMs / 1000}s`),
    n(B.Text, `${Math.round(Math.abs(100 / move.Energy))}x`),
    n(B.Text, `DPS ${info.dps.toFixed(2)} | Gym ${info.gymDPS.toFixed(2)}`),
    n(B.Text, `Dodge ${dodge(move)}s | Start ${startTime(move)}s`),
  ])
)

const ComboDPS = ({
 rate,
}) => (
  n(Card, [
    n(
      B.Text,
      { strong: true },
      `${ucFirst(rate.name)} with ${fixMoveName(rate.atk.name.split('/').join(' and_'))}`
    ),
    n(B.Text, ['Overall: ', rate.rating, '%']),
    n(B.Text, [
      'Attacking: ',
      rate.atk.offenseRating,
      '% ',
      rate.atk.dps.toFixed(2),
      'dps',
    ]),
    n(B.Text, [
      'Defending: ',
      rate.def.defenseRating,
      '% ',
      rate.def.gymDPS.toFixed(2),
      'dps',
    ]),
  ])
)

const PokeInfo = props => (
  n(B.View, { spacingVertical: 'md', spacingHorizontal: 'lg' }, [
    n(B.View, { style: Styles.resultsRow }, [
      n(B.Row, [
        `ATK ${props.pokemon.stats.attack}`,
        `DEF ${props.pokemon.stats.defense}`,
        `STA ${props.pokemon.stats.stamina}`,
      ].map(text => n(B.Col, [n(Badge, { text })]))),

      n(B.Image, {
        src: `images/${props.pokemon.name}.png`,
        height: 100,
        width: 100,
      }),

      n(B.Row, [getType(props.pokemon)]),
    ]),

    n(B.View, { className: 'row' }, [
      // IV Calculator
      n(B.View, { className: 'col c6' }, [
        n(RaterContainer),
      ]),

      // Combo Move DPS
      n(B.View, { className: 'col c6' }, [
        n(ComboDPS, {
          rate: pokeRatings(props.pokemon, props.quick, props.charge),
        })
      ]),
    ]),

    n(Divider),

    n(Tabs, [
      n(Tab, { label: 'Attacking' }, [
        n(B.Text, 'Hi'),
      ]),
      n(Tab, { label: 'Defending' }, [
        n(B.Text, 'Sup'),
      ]),
    ]),

    n(B.View, { className: 'row' }, [
      n(B.View, { className: 'col c6' }, [
        n(B.Text, { strong: true }, 'Quick Moves'),
        n(B.View, props.pokemon.moves1.map(move => n(QuickMoveInfo, {
          move,
          stab: isStab(props.pokemon, move),
          info: PokeMoves[props.pokemon.name][move.Name],
          setState: props.setState,
          selected: props.quick === move.Name,
        }))),
      ]),

      n(B.View, { className: 'col c6' }, [
        n(B.Text, { strong: true }, 'Charge Moves'),
        n(B.View, props.pokemon.moves2.map(move => n(ChargeMoveInfo, {
          move,
          stab: isStab(props.pokemon, move),
          info: PokeMoves[props.pokemon.name][move.Name],
          setState: props.setState,
          selected: props.charge === move.Name,
        }))),
      ]),
    ]),

    n(Divider),
  ])
)


//const dexList = Pokemon.map(x => ({ label: x.name.replace(/_/g, ' '), value: x.name }))
const dexList = Pokemon.map(x => x.name.replace(/_/g, ' '))

function Dex(props) {
  return (
    n(B.View, [
      n(AppBar, {
        title: ucFirst(props.text),
        iconElementLeft: n(IconButton, [
          props.text === '' ? n(SearchIcon) : n(BackIcon),
        ]),
      }, [
        props.text === '' ? (
          n(AutoComplete, {
            hintText: 'Search for Pokemon',
            dataSource: dexList,
          })
        ) : null,
      ]),

      // The search bar at the top
//      n(B.FormControl, [
//        n(Select, {
//          inputProps: {
//            autoCapitalize: 'off',
//            autoCorrect: 'off',
//            spellCheck: 'off',
//          },
//          name: 'move-selector',
//          value: props.text,
//          options: dexList,
//          onChange: ev => redux.dispatch.dexTextChanged(ev.value),
//        }),
//      ]),

      // Empty text then list out all the Pokes
      props.text === '' && (
        Object.keys(Mon).map(mon => (
          n(B.View, { style: { display: 'inline-block' } }, [
            n(B.Image, {
              onClick: () => redux.dispatch.dexTextChanged(mon),
              src: `images/${mon}.png`,
              height: 60,
              width: 60,
            }),
          ])
        ))
      ),

      // The Pokedex view
      Mon.hasOwnProperty(props.text) && (
        n(PokeInfo, {
          pokemon: Mon[props.text],
          quick: props.quick || Mon[props.text].moves1[0].Name,
          charge: props.charge || Mon[props.text].moves2[0].Name,
          setState: props.setState,
        })
      ),

      /*
      Mon.hasOwnProperty(props.text) && n(B.View, [
        n(Matchup, { name: props.text }),
        n(Divider),
      ]),

      Mon.hasOwnProperty(props.text) && (
        n(Report, { pokemon: Mon[props.text] })
      ),
      */
    ])
  )
}

module.exports = liftState({
  quick: null,
  charge: null,
}, Dex)
