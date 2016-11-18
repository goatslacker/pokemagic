const $ = require('../utils/n')
const AppBar = require('material-ui/AppBar').default
const AutoComplete = require('material-ui/AutoComplete').default
const Avatar = require('material-ui/Avatar').default
const BackIcon = require('material-ui/svg-icons/navigation/arrow-back').default
const Chip = require('material-ui/Chip').default
const Divider = require('material-ui/Divider').default
const DustTolevel = require('../../json/dust-to-level.json')
const IconButton = require('material-ui/IconButton').default
const LevelToCPM = require('../../json/level-to-cpm')
const MenuItem = require('material-ui/MenuItem').default
const Paper = require('material-ui/Paper').default
const Pokemon = require('../../json/pokemon.json')
const RaisedButton = require('material-ui/RaisedButton').default
const SelectField = require('material-ui/SelectField').default
const TextField = require('material-ui/TextField').default
const avgComboDPS = require('../../src/avgComboDPS')
const bestVs = require('../../src/bestVs')
const cp = require('../../src/cp')
const getTypeColor = require('../utils/getTypeColor')
const ovRating = require('../../src/ovRating')
const pokeRatings = require('../../src/pokeRatings')
const scrollTop = require('../utils/scrollTop')
const guessIVs = require('../../src/guessIVs')
const { Card, CardHeader, CardText } = require('material-ui/Card')
const { List, ListItem } = require('material-ui/List')
const { Tabs, Tab } = require('material-ui/Tabs')
const { View, Text, Row, Col, Image } = require('../utils/Lotus.React')
const { compose, lifecycle, pure, withState } = require('recompose')
const {
  blueGrey50,
  cyan500,
  green400,
  grey100,
  grey600,
  grey800,
  indigo100,
  indigo400,
  pink500,
  red400,
  yellow300,
} = require('material-ui/styles/colors')

const calculateValues = state => ({
  cp: Number(state.cp),
  hp: Number(state.hp),
  stardust: Number(state.stardust),
//  level: null,
//  attrs: Object.keys(state.attrs || {}),
//  ivRange: IV_RANGE[state.ivRange],
//  stat: STAT_VALUES[state.stat],
})

const transition = (changePokemon, value) => {
  changePokemon(value)
  scrollTop()
}

const calculateIVs = (pokemon, cp, hp, stardust) => {
  const payload = { cp, hp, stardust }
  try {
    const values = calculateValues(payload)
    return guessIVs(values, pokemon)
  } catch (err) {
    console.error(err)
    alert('Looks like there is a problem with the values you entered.')
    return []
  }
}

const sortByAtk = (a, b) => a.info.combo.dps > b.info.combo.dps ? -1 : 1
const sortByDef = (a, b) => a.rate.def.raw > b.rate.def.raw ? -1 : 1

const sortMoves = (pokemon, sortOrder) => (
  pokemon.moves1.reduce((acc, move1) => acc.concat(
    pokemon.moves2.map(move2 => ({
      rate: pokeRatings.getRating(pokemon, move1, move2),
      info: avgComboDPS(pokemon, move1, move2),
    })
  )), []).sort(sortOrder ? sortByAtk : sortByDef)
)

// TODO all data should come clean
const ucFirst = x => x[0].toUpperCase() + x.slice(1).toLowerCase()

const Types = {}
const Mon = Pokemon.reduce((obj, mon) => {
  const type1 = mon.type1
  const type2 = mon.type2

  Types[type1] = type1
  if (type2) Types[type2] = type2

  obj[mon.name] = mon
  return obj
}, {})


const getColor = n => (
  n > 86 ? green400 :
  n > 78 ? yellow300 :
  red400
)

const SmallText = ({
  center,
  label,
  value,
}) => (
  $(Row, {
    horizontal: center ? 'center' : 'flex-start',
  }, [
    $(Text, {
      style: {
        color: grey600,
        fontSize: 14,
        marginRight: 2,
      },
    }, label),
    $(Text, {
      style: {
        color: pink500,
        fontSize: 14,
      },
    }, value),
  ])
)

const MoveInfo = ({
  atk,
  def,
  info,
  rate,
}) => (
  $(Paper, {
    style: {
      padding: 12,
    },
  }, [
    $(Row, {
      horizontal: 'flex-start',
      vertical: 'center',
    }, [
      $(View, {
        style: {
          marginRight: 24,
          textAlign: 'center',
          width: 60,
        },
      }, [
        $(Avatar, {
          backgroundColor: (atk
            ? getColor(rate.atk.offenseRating)
            : getColor(rate.def.defenseRating)
          ),
          color: grey800,
          size: 36,
          style: {
            marginBottom: 2,
          }
        }, atk ? rate.atk.offenseRating : rate.def.defenseRating),

        $(View, [
          atk && $(SmallText, { center: true, label: 'DPS', value: rate.atk.dps }),
          def && $(SmallText, { center: true, label: 'DPS', value: rate.def.gymDPS }),
        ]),
      ]),

      $(Row, [
        $(Col, [
          $(View, [
            $(Text, {
              style: {
                fontWeight: info.quick.stab ? 'bold' : 'normal',
                textDecoration: info.quick.retired ? 'line-through' : 'none',
              },
            }, info.quick.name),
            atk && $(SmallText, { label: 'CD', value: `${info.quick.base.duration}s` }),
            atk && $(SmallText, { label: 'EPS', value: info.quick.eps }),
            def && $(SmallText, { label: 'Start', value: info.quick.startTime }),
            def && $(SmallText, { label: 'DMG', value: info.quick.dmg }),
            console.log('@', info),
          ]),

        ]),

        $(Col, [
          $(View, [
            $(Text, {
              style: {
                fontWeight: info.charge.stab ? 'bold' : 'normal',
                textDecoration: info.charge.retired ? 'line-through' : 'none',
              },
            }, info.charge.name),
            atk && $(SmallText, { label: 'CD', value: `${info.charge.base.duration}s` }),
            atk && $(SmallText, { label: 'Charges', value: info.charge.charges }),
            def && $(SmallText, { label: 'Start', value: `${info.charge.startTime}s` }),
            def && $(SmallText, { label: 'DMG', value: info.charge.dmg }),
          ]),
        ]),
      ]),
    ]),
  ])
)

const BestInfo = ({
  best,
}) => (
  $(Card, {
  }, [
    $(CardHeader, {
      actAsExpander: best.rest.length > 0,
      showExpandableButton: best.rest.length > 0,
      subtitle: (
        $(View, [
          $(Text, `${best.quickMove} + ${best.chargeMove}`),
          $(Text, `${best.dps} dps | ${best.ttl} ttl`),
        ])
      ),
      title: best.name,
    }),
    best.rest.length > 0 && (
      $(CardText, {
        expandable: true,
      }, best.rest.map(rest => (
        $(CardHeader, {
          title: `${rest.quickMove} + ${rest.chargeMove}`,
          subtitle: (
            $(View, [
              $(Text, `${rest.dps} dps`),
              $(Text, `${rest.ttl} ttl`),
            ])
          ),
        })
      )))
    ),
  ])
)

const BestOpponent = ({
  best,
}) => (
  $(Tabs, [
    $(Tab, {
      label: 'Score',
    }, best
      .sort((a, b) => a.score > b.score ? -1 : 1)
      .map(best => $(BestInfo, { best }))
      .slice(0, 10)
    ),
    $(Tab, {
      label: 'DPS',
    }, best
      .sort((a, b) => a.dps > b.dps ? -1 : 1)
      .map(best => $(BestInfo, { best }))
      .slice(0, 10)
    ),
    $(Tab, {
      label: 'TTL',
    }, best
      .sort((a, b) => a.ttl > b.ttl ? -1 : 1)
      .map(best => $(BestInfo, { best }))
      .slice(0, 10)
    ),
  ])
)

const Module = ({
  title,
  children,
}) => (
  $(Paper, {
    style: {
      marginTop: 40,
    },
  }, [
    title && $(View, {
      style: {
        paddingBottom: 12,
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 12,
      },
    }, [
      $(Row, {
        horizontal: 'center',
      }, [
        $(Text, { strong: true }, title),
      ]),
    ])
  ].concat(children, [
    $(Divider),
  ].filter(Boolean)))
)

const BestVs = pure(({
  pokemon,
}) => (
  $(Module, {
    title: `Best vs ${ucFirst(pokemon.name)}`,
  }, [
    $(BestOpponent, {
      best: bestVs(pokemon),
    }),
  ])
))

const Movesets = pure(({
  pokemon,
}) => (
  $(Module, {
    title: 'Movesets',
  }, [
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
  ])
))

const PokeInfo = pure(({
  pokemon,
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
  ])
))

const IVCalculator = compose(
  withState('ivCP', 'setCP', '1049'),
  withState('ivHP', 'setHP', '154'),
  withState('ivStardust', 'setStardust', '1300'),
  withState('ivResults', 'setResults', [])
)(({
  ivCP,
  ivHP,
  ivResults,
  ivStardust,
  pokemon,
  setCP,
  setHP,
  setResults,
  setStardust,
}) => (
  $(Module, {
    title: ivResults.length ? `${ivResults.length} Possible IVs` : 'IVs',
  }, [
    ivResults.length > 0 && (
      $(List, ivResults.map(result => (
        $(ListItem, {
          leftAvatar: (
            $(Avatar, {
              backgroundColor: getColor(result.range.pokemon),
              color: grey800,
            }, result.range.pokemon)
          ),
          primaryText: `${result.ivs.atk}/${result.ivs.def}/${result.ivs.sta}`,
          secondaryText: `Level ${result.level}`,
        })
      )))
    ),

    ivResults.length === 0 && (
      $(Col, {
        horizontal: 'center',
      }, [
        $(TextField, {
          floatingLabelText: 'CP',
          value: ivCP,
          onClick: () => setCP(''),
          onChange: ev => setCP(ev.target.value),
          type: 'number',
        }),

        $(TextField, {
          floatingLabelText: 'HP',
          value: ivHP,
          onClick: () => setHP(''),
          onChange: ev => setHP(ev.target.value),
          type: 'number',
        }),

        $(SelectField, {
          floatingLabelText: 'Stardust',
          value: ivStardust,
          onChange: ev => setStardust(ev.target.innerText),
        }, Object.keys(DustTolevel)
          .map(n => $(MenuItem, { value: n, primaryText: n }))
        ),

//          $(Row, {
//            horizontal: 'center',
//            style: {
//              marginBottom: 24,
//              marginTop: 24,
//            },
//          }, [red300, blue300, yellow300].map(backgroundColor => (
//            $(Avatar, {
//              backgroundColor,
//              style: {
//                marginLeft: 32,
//                marginRight: 32,
//              },
//            })
//          ))),

        // TODO I need a spacing component
        $(RaisedButton, {
          label: 'Calculate',
          primary: true,
          onClick: () => setResults(
            calculateIVs(pokemon, ivCP, ivHP, ivStardust)
          ),
          style: {
            marginBottom: 24,
            marginTop: 24,
          },
        }),
      ])
    ),
  ])
))

const PokemonPage = pure(({
  pokemon,
}) => (
  $(View, {
    style: {
      backgroundColor: grey100,
    },
  }, [
    $(PokeInfo, { pokemon }),
    $(Movesets, { pokemon }),
    $(BestVs, { pokemon }),
    $(IVCalculator, { pokemon }),
  ])
))

const PokeImage = ({
  changePokemon,
  pokemon,
}) => (
  $(Image, {
    onClick: () => transition(changePokemon, pokemon),
    src: `images/${pokemon.name}.png`,
    height: 120,
    width: 120,
  })
)

const PokemonByMaxCP = Pokemon.map(x => Object.assign({
  cp: cp.getMaxCPForLevel(x, LevelToCPM['40']),
}, x)).sort((a, b) => a.cp > b.cp ? -1 : 1)

const PokemonByMaxAtk = Pokemon.map(x => Object.assign({
  atk: ovRating(x).atk,
}, x)).sort((a, b) => a.atk > b.atk ? -1 : 1)

const PokemonByMaxDef = Pokemon.map(x => Object.assign({
  def: ovRating(x).def,
}, x)).sort((a, b) => a.def > b.def ? -1 : 1)

const PokeList = pure(({
  changePokemon,
}) => (
  $(Tabs, {
    initialSelectedIndex: 3,
  }, [
    $(Tab, { label: '#' }, Pokemon.map(pokemon => $(PokeImage, { pokemon, changePokemon }))),
    $(Tab, { label: 'CP' }, PokemonByMaxCP.map(pokemon => $(PokeImage, { pokemon, changePokemon }))),
    $(Tab, { label: 'Atk' }, PokemonByMaxAtk.map(pokemon => $(PokeImage, { pokemon, changePokemon }))),
    $(Tab, { label: 'Def' }, PokemonByMaxDef.map(pokemon => $(PokeImage, { pokemon, changePokemon }))),
  ])
))

const dexList = Pokemon.map(x => x.name.replace(/_/g, ' '))

const Dex = ({
  changePokemon,
  pokemon,
}) => (
  $(View, {
    className: 'main',
  }, [
    !pokemon && (
      $(Paper, {
        style: {
          alignItems: 'center',
          backgroundColor: cyan500,
          color: '#fff',
          flex: 1,
          display: 'flex',
          height: 64,
        },
      }, [
        $(AutoComplete, {
          dataSource: dexList,
          filter: (searchText, key) => key.indexOf(searchText.toUpperCase()) > -1,
          fullWidth: true,
          hintText: 'Search for Pokemon',
          onNewRequest: text => transition(changePokemon, Mon[text.toUpperCase()]),
        })
      ])
    ),
    pokemon && (
      $(AppBar, {
        title: pokemon ? ucFirst(pokemon.name) : null,
        onLeftIconButtonTouchTap: () => transition(changePokemon, null),
        iconElementLeft: $(IconButton, { touch: true }, [$(BackIcon)]),
        iconElementRight: $(IconButton, {
          style: {
            marginRight: 8,
            marginTop: -8,
          },
        }),
      })
    ),

    // Empty text then list out all the Pokes
    pokemon === null && $(PokeList, { changePokemon }),

    // The Pokedex view
    pokemon !== null && $(PokemonPage, { pokemon }),
  ])
)

const findPokemon = name => (
  Pokemon.filter(x => x.name === name.toUpperCase())[0]
)

const hashChanged = () => findPokemon(window.location.hash.split('/')[1] || '')

const maybeChangePokemonFromHash = ({
  changePokemon
}) => {
  const poke = hashChanged()
  if (poke) transition(changePokemon, poke)
}

module.exports = compose(
  withState('pokemon', 'changePokemon', null),
  lifecycle({
    componentDidMount() {
      maybeChangePokemonFromHash(this.props)
      window.onhashchange = () => maybeChangePokemonFromHash(this.props)
    },
  })
)(Dex)
