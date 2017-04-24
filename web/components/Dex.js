const $ = require('../utils/n')
const AppBar = require('material-ui/AppBar').default
const AutoComplete = require('material-ui/AutoComplete').default
const Avatar = require('material-ui/Avatar').default
const BackIcon = require('material-ui/svg-icons/navigation/arrow-back').default
const Chip = require('material-ui/Chip').default
const Divider = require('material-ui/Divider').default
const DustTolevel = require('../../json/dust-to-level.json')
const IconButton = require('material-ui/IconButton').default
const IconMenu = require('material-ui/IconMenu').default
const LevelToCPM = require('../../json/level-to-cpm')
const Menu = require('material-ui/Menu').default
const MenuItem = require('material-ui/MenuItem').default
const MoreVertIcon = require('material-ui/svg-icons/navigation/more-vert').default
const Paper = require('material-ui/Paper').default
const Pokemon = require('../../json/pokemon.json')
const Popover = require('material-ui/Popover').default
const RaisedButton = require('material-ui/RaisedButton').default
const SelectField = require('material-ui/SelectField').default
const TextField = require('material-ui/TextField').default
const avgComboDPS = require('../../src/avgComboDPS')
const bestVs = require('../../src/bestVs')
const cp = require('../../src/cp')
const getTypeColor = require('../utils/getTypeColor')
const goodFor = require('../../src/goodFor')
const ovRating = require('../../src/ovRating')
const pokeRatings = require('../../src/pokeRatings')
const scrollTop = require('../utils/scrollTop')
const guessIVs = require('../../src/guessIVs')
const { Card, CardHeader, CardText } = require('material-ui/Card')
const { List, ListItem } = require('material-ui/List')
const { Tabs, Tab } = require('material-ui/Tabs')
const { View, Text, Row, Col } = require('../utils/Lotus.React')
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

const AllPokemon = Pokemon.map(x => Object.assign({
  l30CP: cp.getMaxCPForLevel(x, LevelToCPM['30']),
  maxCP: cp.getMaxCPForLevel(x, LevelToCPM['40']),
  atk: ovRating(x).atk,
  def: ovRating(x).def,
}, x))

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

const chunk2 = arr => arr.map((x, i, l) => {
  if (i % 2 === 0) return l.slice(i, i + 2)
  return null
}).filter(Boolean)

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
  pokemon.moves.combo.reduce((acc, x) => {
    const move1 = x.A
    const move2 = x.B
    return acc.concat({
      rate: pokeRatings.getRating(pokemon, move1, move2),
      info: avgComboDPS(pokemon, move1, move2),
    })
  }, []).sort(sortOrder ? sortByAtk : sortByDef)
)

// TODO all data should come clean
const ucFirst = x => x[0].toUpperCase() + x.slice(1).toLowerCase()

const Types = {}
const PokeMap = AllPokemon.reduce((obj, mon) => {
  const type1 = mon.type1
  const type2 = mon.type2

  Types[type1] = type1
  if (type2) Types[type2] = type2

  obj[mon.name] = mon
  if (!obj[mon.family]) obj[mon.family] = []
  obj[mon.family].push(mon)
  return obj
}, {})

const filterByType = type => mon => mon.type1 === type || mon.type2 === type

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

const SmallPokeInfo = ({
  poke,
}) => (
  $(Row, {
    vertical: 'center',
  }, [
    $(Avatar, {
      backgroundColor: getTypeColor(poke),
      src: `images/${poke.name}.png`,
      size: 32,
      style: {
        marginRight: 4,
        padding: 4,
      },
    }),
    $(Col, [
      $(View, {
        style: { marginLeft: 4 },
      }, [
        $(Text, ucFirst(poke.name)),
        $(SmallText, { label: 'DPS', value: poke.dps.toFixed(2) }),
      ]),
    ]),
  ])
)

const MoveInfo = ({
  atk,
  def,
  info,
}) => (
  $(Paper, {
    style: {
      padding: 24,
    },
  }, [
    $(Row, {
      horizontal: 'center',
      vertical: 'center',
    }, [
      $(Col, {
        horizontal: 'center',
      }, [
        $(View, {
          style: {
            marginBottom: 8,
          },
        }, [
          $(Text, {
            style: {
              fontWeight: info.quick.stab ? 'bold' : 'normal',
              textDecoration: info.combo.retired ? 'line-through' : 'none',
            },
          }, info.quick.name),
          $(Row, {
            horizontal: 'space-around',
          }, [
            $(Col, {
            }, [
              $(View, {
                style: { marginRight: 8 },
              }, [
                $(SmallText, { label: 'DMG', value: info.quick.dmg }),
                $(SmallText, { label: 'CD', value: `${info.quick.base.duration}s` }),
              ]),
            ]),
            $(Col, [
              $(SmallText, { label: 'EPS', value: info.quick.eps }),
              $(SmallText, { label: 'Start', value: info.quick.startTime }),
            ]),
          ]),
        ]),
      ]),

      $(Col, {
        horizontal: 'center',
      }, [
        $(View, {
          style: {
            marginBottom: 8,
          },
        }, [
          $(Text, {
            style: {
              fontWeight: info.charge.stab ? 'bold' : 'normal',
              textDecoration: info.combo.retired ? 'line-through' : 'none',
            },
          }, info.charge.name),
          $(Row, {
            horizontal: 'space-around',
          }, [
            $(Col, [
              $(View, {
                style: { marginRight: 8 },
              }, [
                $(SmallText, { label: 'DMG', value: info.charge.dmg }),
                $(SmallText, { label: 'CD', value: `${info.charge.base.duration}s` }),
              ]),
            ]),
            $(Col, [
              $(SmallText, { label: 'Charges', value: info.charge.charges }),
              $(SmallText, { label: 'Start', value: `${info.charge.startTime}s` }),
            ]),
          ]),
        ]),
      ]),

    ]),

    $(View, {
      style: {
        marginBottom: 16,
        marginTop: 16,
        textAlign: 'center',
      },
    }, [
      $(Text, { strong: true }, 'This moveset is good against'),
      chunk2(info.meta.goodAgainst.slice(0, 4)).map(pokes => (
        $(View, {
          key: pokes[0].name + pokes[1].name,
          style: { paddingTop: 4, paddingBottom: 4 },
        }, [
          $(Row, {
            horizontal: 'center',
          }, [
            $(Col, {
              horizontal: 'center',
            }, [$(SmallPokeInfo, { poke: pokes[0] })]),
            $(Col, {
              horizontal: 'center',
            }, [$(SmallPokeInfo, { poke: pokes[1] })]),
          ]),
        ])
      )),
    ]),

    $(View, {
      style: {
        marginBottom: 16,
        marginTop: 16,
        textAlign: 'center',
      },
    }, [
      $(Text, { strong: true }, 'This moveset vs Top Gym Defenders'),
      chunk2(info.meta.common).map(pokes => (
        $(View, {
          key: pokes[0].name + pokes[1].name,
          style: { paddingTop: 4, paddingBottom: 4 },
        }, [
          $(Row, {
            horizontal: 'center',
          }, [
            $(Col, {
              horizontal: 'center',
            }, [$(SmallPokeInfo, { poke: pokes[0] })]),
            $(Col, {
              horizontal: 'center',
            }, [$(SmallPokeInfo, { poke: pokes[1] })]),
          ]),
        ])
      )),
    ]),
  ])
)

const BestInfo = ({
  best,
}) => (
  $(Card, {
  }, [
    $(CardHeader, {
      avatar: `images/${best.name.toUpperCase()}.png`,
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

const GoodInfo = ({
  poke,
}) => (
  $(Card, [
    $(CardHeader, {
      avatar: `images/${poke.name.toUpperCase()}.png`,
      subtitle: [poke.type1, poke.type2].filter(Boolean).map(ucFirst).join('/'),
      title: ucFirst(poke.name),
    }),
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

const GoodAgainst = pure(({
  pokemon,
}) => (
  $(Module, {
    title: `${ucFirst(pokemon.name)} is good against...`,
  }, goodFor(pokemon).map(poke => $(GoodInfo, { poke })))
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
          info: res.info,
          atk: true,
        })
      ))),

      $(Tab, { label: 'Defending' }, sortMoves(pokemon, 0).map(res => (
        $(MoveInfo, {
          key: `DEF+${res.info.combo.name}`,
          info: res.info,
          def: true,
        })
      ))),
    ]),
  ])
))

const Chippy = pure(({
  leftText,
  rightText,
}) => (
  $(Chip, {
    backgroundColor: indigo100,
    style: {
      marginBottom: 4,
    },
  }, [
    $(Row, { horizontal: true }, [
      $(Text, { style: { marginRight: 4 } }, leftText),
      $(Text, { strong: true }, rightText),
    ])
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
        $(Chippy, { leftText: 'Max CP', rightText: pokemon.maxCP }),
        $(Chippy, { leftText: 'L30 CP', rightText: pokemon.l30CP }),
        $(Chippy, {
          leftText: [pokemon.type1, pokemon.type2].filter(Boolean).join(' / '),
          rightText: null,
        }),
      ]),

      $(Col, [
        $(Chippy, { leftText: 'Atk', rightText: pokemon.stats.attack }),
        $(Chippy, { leftText: 'Def', rightText: pokemon.stats.defense }),
        $(Chippy, { leftText: 'Sta', rightText: pokemon.stats.stamina }),
      ]),
    ]),
  ])
))

const Evolution = pure(({
  changePokemon,
  evolution,
  selectedPokemon,
}) => (
  $(Module, {
    title: 'Evolution',
  }, [
    $(Row, {
      horizontal: 'center',
    }, evolution.filter(x => selectedPokemon.name !== x.name).map(pokemon => (
      $(PokeImage, {
        changePokemon,
        pokemon,
        size: 60,
      })
    ))),
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
  changePokemon,
  pokemon,
}) => (
  $(View, {
    style: {
      backgroundColor: grey100,
    },
  }, [
    $(PokeInfo, { pokemon }),
    PokeMap[pokemon.family].length > 1 && $(Evolution, {
      changePokemon,
      evolution: PokeMap[pokemon.family],
      selectedPokemon: pokemon,
    }),
    $(Movesets, { pokemon }),
    $(BestVs, { pokemon }),
    $(GoodAgainst, { pokemon }),
  ])
))

const PokeImage = ({
  changePokemon,
  pokemon,
  size,
}) => (
  $('img', {
    onClick: () => transition(changePokemon, pokemon),
    src: `images/${pokemon.name}.png`,
    height: size || 120,
    width: size || 120,
  })
)

const PokemonByMaxCP = AllPokemon.slice().sort((a, b) => a.maxCP > b.maxCP ? -1 : 1)
const PokemonByMaxAtk = AllPokemon.slice().sort((a, b) => a.atk > b.atk ? -1 : 1)
const PokemonByMaxDef = AllPokemon.slice().sort((a, b) => a.def > b.def ? -1 : 1)
const PokemonByDPS = AllPokemon.map(poke => {
  const moves = poke.moves.combo.map(x => {
    const move1 = x.A
    const move2 = x.B
    const info = avgComboDPS(poke, move1, move2)
    return { poke, dps: info.combo.dps }
  }).sort((a, b) => a.dps > b.dps ? -1 : 1)

  return Object.assign({
    dps: moves[0].dps,
  }, moves[0].poke)
}).sort((a, b) => a.dps > b.dps ? -1 : 1)

const PokeList = pure(({
  changePokemon,
  list,
}) => (
  $(View, list.map(pokemon => $(PokeImage, { pokemon, changePokemon })))
))

const dexList = AllPokemon.map(x => x.name.replace(/_/g, ' '))

const Dex = ({
  changePokemon,
  pokemon,
  list,
  sortPokemon,
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
        $(IconMenu, {
          iconButtonElement: $(IconButton, { touch: true }, [$(MoreVertIcon)]),
          anchorOrigin: { horizontal: 'left', vertical: 'top' },
          targetOrigin: { horizontal: 'left', vertical: 'top' },
        }, [
          $(MenuItem, {
            primaryText: '#',
            onTouchTap: () => sortPokemon(AllPokemon),
          }),
          $(MenuItem, {
            primaryText: 'DPS',
            onTouchTap: () => sortPokemon(PokemonByDPS),
          }),
          $(MenuItem, {
            primaryText: 'CP',
            onTouchTap: () => sortPokemon(PokemonByMaxCP),
          }),
          $(MenuItem, {
            primaryText: 'Atk',
            onTouchTap: () => sortPokemon(PokemonByMaxAtk),
          }),
          $(MenuItem, {
            primaryText: 'Def',
            onTouchTap: () => sortPokemon(PokemonByMaxDef),
          }),
        ].concat(
          Object.keys(Types).map(type => (
            $(MenuItem, {
              primaryText: ucFirst(type),
              onTouchTap: () => sortPokemon(
                PokemonByMaxCP.filter(filterByType(type))
              ),
            })
          ))
        )),
        $(AutoComplete, {
          dataSource: dexList,
          filter: (searchText, key) => key.indexOf(searchText.toUpperCase()) > -1,
          fullWidth: true,
          hintText: 'Search for Pokemon',
          onNewRequest: text => transition(changePokemon, PokeMap[text.toUpperCase()]),
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
    pokemon === null && $(PokeList, { list, changePokemon }),

    // The Pokedex view
    pokemon !== null && $(PokemonPage, { changePokemon, pokemon }),
  ])
)

const findPokemon = name => (
  AllPokemon.filter(x => x.name === name.toUpperCase())[0]
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
  withState('list', 'sortPokemon', AllPokemon),
  lifecycle({
    componentDidMount() {
      maybeChangePokemonFromHash(this.props)
      window.onhashchange = () => maybeChangePokemonFromHash(this.props)
    },
  })
)(Dex)
