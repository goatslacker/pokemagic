const AppBar = require('material-ui/AppBar').default
const Appraisal = require('./Appraisal')
const AutoComplete = require('material-ui/AutoComplete').default
const Avatar = require('material-ui/Avatar').default
const BackIcon = require('material-ui/svg-icons/navigation/arrow-back').default
const Badge = require('material-ui/Badge').default
const Chip = require('material-ui/Chip').default
const Divider = require('material-ui/Divider').default
const FormPokemonLevel = require('./FormPokemonLevel')
const FormPokemonName = require('./FormPokemonName')
const FormStardust = require('./FormStardust')
const IconButton = require('material-ui/IconButton').default
const Matchup = require('./Matchup')
const MoveCombos = require('./MoveCombos')
const MovesList = require('../../json/moves.json')
const Paper = require('material-ui/Paper').default
const Pokemon = require('../../json/pokemon.json')
const RaisedButton = require('material-ui/RaisedButton').default
const Results = require('./Results')
const SearchIcon = require('material-ui/svg-icons/action/search').default
const Select = require('react-select')
const Styles = require('../styles')
const TypeBadge = require('./TypeBadge')
const analyzeBattleEffectiveness = require('../../src/analyzeBattleEffectiveness')
const avgComboDPS = require('../../src/avgComboDPS')
const getTypeColor = require('../utils/getTypeColor')
const liftState = require('../utils/liftState')
const n = require('../utils/n')
const ovRating = require('../utils/ovRating')
const pokeRatings = require('../utils/pokeRatings')
const reactRedux = require('react-redux')
const redux = require('../redux')
const { Card } = require('material-ui/Card')
const { List, ListItem } = require('material-ui/List')
const { Tabs, Tab } = require('material-ui/Tabs')
const { View, Text, Row, Col, Image } = require('../utils/Lotus.React')
const {
  blueGrey50,
  green400,
  grey800,
  indigo100,
  indigo400,
  red400,
  yellow300,
} = require('material-ui/styles/colors')

const $ = n

const sortByAtk = (a, b) => a.info.combo.dps > b.info.combo.dps ? -1 : 1
const sortByDef = (a, b) => a.info.combo.gymDPS > b.info.combo.gymDPS ? -1 : 1

const sortMoves = (pokemon, sortOrder) => (
  pokemon.moves1.reduce((acc, move1) => acc.concat(
    pokemon.moves2.map(move2 => ({
      rate: pokeRatings.getRating(pokemon, move1.Name, move2.Name),
      info: avgComboDPS(pokemon, move1, move2),
    })
  )), []).sort(sortOrder ? sortByAtk : sortByDef)
)

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

const Overall = ({ rate }) => (
  n(B.View, [
    n(Chip, `OVR ${rate.ovr}% ${rate.atk}/${rate.def}`),
  ])
)

const getColor = n => (
  n > 86 ? green400 :
  n > 78 ? yellow300 :
  red400
)

const MoveInfo = ({
  atk,
  def,
  info,
  rate,
}) => (
  $(Paper, {
    style: {
      paddingBottom: 12,
      paddingLeft: 24,
      paddingRight: 24,
      paddingTop: 12,
    },
  }, [
    $(Row, {
      vertical: 'center',
    }, [
      $(Col, [
        $(View, [
          $(Text, info.quick.name),
          $(Text, info.charge.name),
        ]),
      ]),

      $(Col, [
        atk && (
          $(Chip, {
            backgroundColor: blueGrey50,
          }, [
            $(Avatar, {
              backgroundColor: getColor(rate.atk.offenseRating),
              color: grey800,
            }, rate.atk.offenseRating),
            $(Text, rate.atk.dps.toFixed(2)),
          ])
        ),

        def && (
          $(Chip, {
            backgroundColor: blueGrey50,
          }, [
            $(Avatar, {
              backgroundColor: getColor(rate.def.defenseRating),
              color: grey800,
            }, rate.def.defenseRating),
            $(Text, rate.def.gymDPS.toFixed(2)),
          ])
        ),
      ]),
    ]),
  ])
)

const PokeInfo = ({
  pokemon,
}) => (
  $(View, [
    $(Paper, {
      style: {
        paddingBottom: 12,
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 12,
      },
    }, [
      $(Row, {
        vertical: 'center',
      }, [
        $(Col, [
          $(Avatar, {
            backgroundColor: getTypeColor(pokemon),
            src: `images/${pokemon.name}.png`,
            size: 100,
            style: {
              padding: 4,
            },
          })
        ]),
        $(Col, [
          $(RaisedButton, {
            label: 'Get IVs',
            secondary: true,
          }),
        ]),
      ]),

      $(Row, {
        horizontal: 'space-around',
        vertical: 'center',
      }, [
        $(Chip, {
          backgroundColor: indigo100,
        }, [
          $(Avatar, {
            backgroundColor: indigo400,
          }, pokemon.stats.attack),
          $(Text, 'ATK'),
        ]),

        $(Chip, {
          backgroundColor: indigo100,
        }, [
          $(Avatar, {
            backgroundColor: indigo400,
          }, pokemon.stats.defense),
          $(Text, 'DEF'),
        ]),

        $(Chip, {
          backgroundColor: indigo100,
        }, [
          $(Avatar, {
            backgroundColor: indigo400,
          }, pokemon.stats.stamina),
          $(Text, 'STA'),
        ]),
      ]),
    ]),

    $(Divider),

    $(Tabs, [
      $(Tab, { label: 'Attacking' }, sortMoves(pokemon, 1).map(res => (
        $(MoveInfo, {
          key: `ATK+${res.info.combo.name}`,
          rate: res.rate,
          info: res.info,
          atk: true,
        })
      ))),

      $(Tab, { label: 'Defending' }, sortMoves(pokemon, 0).map(res => (
        $(MoveInfo, {
          key: `DEF+${res.info.combo.name}`,
          rate: res.rate,
          info: res.info,
          def: true,
        })
      ))),
    ]),

    $(Divider),
  ])
)


//const dexList = Pokemon.map(x => ({ label: x.name.replace(/_/g, ' '), value: x.name }))
const dexList = Pokemon.map(x => x.name.replace(/_/g, ' '))

function Dex(props) {
  return (
    n(View, [
      n(AppBar, {
        title: ucFirst(props.text),
        onLeftIconButtonTouchTap: () => redux.dispatch.dexTextChanged(''),
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

      // Empty text then list out all the Pokes
      props.text === '' && (
        Object.keys(Mon).map(mon => (
          $(View, { style: { display: 'inline-block' } }, [
            $(Image, {
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
        $(PokeInfo, {
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
