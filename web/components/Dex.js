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
const MenuItem = require('material-ui/MenuItem').default
const MoveCombos = require('./MoveCombos')
const MovesList = require('../../json/moves.json')
const Paper = require('material-ui/Paper').default
const Pokemon = require('../../json/pokemon.json')
const RaisedButton = require('material-ui/RaisedButton').default
const Results = require('./Results')
const SearchIcon = require('material-ui/svg-icons/action/search').default
const Select = require('react-select')
const SelectField = require('material-ui/SelectField').default
const Styles = require('../styles')
const TextField = require('material-ui/TextField').default
const TypeBadge = require('./TypeBadge')
const analyzeBattleEffectiveness = require('../../src/analyzeBattleEffectiveness')
const avgComboDPS = require('../../src/avgComboDPS')
const getTypeColor = require('../utils/getTypeColor')
const $ = require('../utils/n')
const ovRating = require('../utils/ovRating')
const pokeRatings = require('../utils/pokeRatings')
const reactRedux = require('react-redux')
const redux = require('../redux')
const { Card } = require('material-ui/Card')
const { List, ListItem } = require('material-ui/List')
const { Tabs, Tab } = require('material-ui/Tabs')
const { View, Text, Row, Col, Image } = require('../utils/Lotus.React')
const { compose, withState } = require('recompose')
const {
  blueGrey50,
  green400,
  grey50,
  grey800,
  indigo100,
  indigo400,
  red400,
  yellow300,
} = require('material-ui/styles/colors')

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

const DustToLevel = require('../../json/dust-to-level.json')

const dustOptions = Object.keys(DustToLevel).map(x => Number(x))
const logStardust = x => redux.dispatch.changedStardust(x)

function Rater(props) {
  if (props.results) return $(Results, props.results)

  return $(Paper, [
    $(TextField, {
      type: 'number',
      hintText: 'CP',
      onChange: ev => redux.dispatch.changedCp(ev.currentTarget.value),
      onClick: () => redux.dispatch.changedCp(''),
    }),

    $(TextField, {
      type: 'number',
      hintText: 'HP',
      onChange: ev => redux.dispatch.changedHp(ev.currentTarget.value),
      onClick: () => redux.dispatch.changedHp(''),
    }),

    $(SelectField, {
      floatingLabelText: 'Select Stardust',
      value: '3500',
      onChange: logStardust,
    }, dustOptions.map(value => $(MenuItem, { value, primaryText: value }))),
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

const ucFirst = x => x[0].toUpperCase() + x.slice(1).toLowerCase()

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


const isStab = (pokemon, move) => (
  [pokemon.type1, pokemon.type2]
    .filter(Boolean)
    .filter(type => type === move.Type)
    .length > 0
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

const PokeInfoComponent = ({
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
          $(Chip, {
            backgroundColor: indigo100,
            style: {
              marginBottom: 4,
            },
          }, [
            $(Avatar, {
              backgroundColor: indigo400,
            }, pokemon.stats.attack),
            $(Text, 'ATK'),
          ]),

          $(Chip, {
            backgroundColor: indigo100,
            style: {
              marginBottom: 4,
            },
          }, [
            $(Avatar, {
              backgroundColor: indigo400,
            }, pokemon.stats.defense),
            $(Text, 'DEF'),
          ]),

          $(Chip, {
            backgroundColor: indigo100,
            style: {
              marginBottom: 4,
            },
          }, [
            $(Avatar, {
              backgroundColor: indigo400,
            }, pokemon.stats.stamina),
            $(Text, 'STA'),
          ]),
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

const PokeInfo = compose(
  withState('iv', 'showIVCalc', false)
)(PokeInfoComponent)

//const dexList = Pokemon.map(x => ({ label: x.name.replace(/_/g, ' '), value: x.name }))
const dexList = Pokemon.map(x => x.name.replace(/_/g, ' '))

function Dex(props) {
  return (
    $(View, [
      props.text === '' && (
        $(Paper, {
        }, [
          $(AutoComplete, {
            dataSource: dexList,
            filter: (searchText, key) => key.indexOf(searchText.toUpperCase()) > -1,
            fullWidth: true,
            hintText: 'Search for Pokemon',
            onNewRequest: text => redux.dispatch.dexTextChanged(text),
          })
        ])
      ),
      props.text !== '' && (
        $(AppBar, {
          title: props.text
          ? ucFirst(props.text)
          : (
            null
          ),
          onLeftIconButtonTouchTap: () => redux.dispatch.dexTextChanged(''),
          iconElementLeft: $(IconButton, [
            props.text === '' ? $(SearchIcon) : $(BackIcon),
          ]),
        })
      ),

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
    ])
  )
}

module.exports = Dex
