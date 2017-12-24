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


// TODO rm all these
const addTMCombinations = require('../../src/addTMCombinations')
const avgComboDPS = require('../../src/avgComboDPS')
const cp = require('../../src/cp')
const getTypeColor = require('../utils/getTypeColor')
const guessIVs = require('../../src/guessIVs')
const hp = require('../../src/hp')
const ovRating = require('../../src/ovRating')
const pokeRatings = require('../../src/pokeRatings')

const scrollTop = require('../utils/scrollTop')
const transmitter = require('transmitter')
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
  yellow600,
} = require('material-ui/styles/colors')

const bus = transmitter()

const AllPokemon = Pokemon.map(x => Object.assign({
  l30CP: cp.getMaxCPForLevel(x, LevelToCPM['30']),
  maxCP: cp.getMaxCPForLevel(x, LevelToCPM['40']),
  atk: ovRating(x).atk,
  def: ovRating(x).def,
}, x))

const changePokemon = pokemon => {
  bus.publish(pokemon)
  scrollTop()
}

const chunk2 = arr => arr.map((x, i, l) => {
  if (i % 2 === 0) return l.slice(i, i + 2)
  return null
}).filter(Boolean)

const sortByAtk = (a, b) => a.info.combo.dps > b.info.combo.dps ? -1 : 1
const sortByDef = (a, b) => a.rate.def.raw > b.rate.def.raw ? -1 : 1

const sortMoves = (pokemon, sortOrder) => {
  const moves = addTMCombinations(pokemon)
  return moves.reduce((acc, x) => {
    const move1 = x.A
    const move2 = x.B
    return acc.concat({
      rate: pokeRatings.getRating(pokemon, move1, move2),
      info: avgComboDPS(pokemon, move1, move2),
    })
  }, []).sort(sortOrder ? sortByAtk : sortByDef)
}

// TODO all data should come clean
const ucFirst = x => x[0].toUpperCase() + x.slice(1).toLowerCase()

const timeoutRatio = (dps, opp) => dps * 60 / (hp.getHP(opp, 15, LevelToCPM['40']) * 2)

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
  textColor,
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
        color: textColor || pink500,
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
      onClick: () => changePokemon(poke),
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
        $(SmallText, {
          label: 'DPS',
          textColor: (
            timeoutRatio(poke.dps, poke) > 2 ? green400 :
            timeoutRatio(poke.dps, poke) > 1 ? yellow600 :
            red400
          ),
          value: poke.dps.toFixed(2),
        }),
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
        pokemon,
        size: 60,
      })
    ))),
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
    PokeMap[pokemon.family].length > 1 && $(Evolution, {
      evolution: PokeMap[pokemon.family],
      selectedPokemon: pokemon,
    }),
    $(Movesets, { pokemon }),
//    $(BestVs, { pokemon }),
  ])
))

const PokeImage = ({
  pokemon,
  size,
}) => (
  $('img', {
    onClick: () => changePokemon(pokemon),
    src: `images/${pokemon.name}.png`,
    height: size || 120,
    width: size || 120,
  })
)

const PokemonByMaxCP = AllPokemon.slice().sort((a, b) => a.maxCP > b.maxCP ? -1 : 1)
const PokemonByMaxAtk = AllPokemon.slice().sort((a, b) => a.atk > b.atk ? -1 : 1)
const PokemonByMaxDef = AllPokemon.slice().sort((a, b) => a.def > b.def ? -1 : 1)
const PokemonByDPS = AllPokemon.map(poke => {
  const combo = []
  poke.moves.quick.forEach(A => {
    poke.moves.charge.forEach(B => {
      combo.push({ A, B })
    })
  })

  const moves = combo.map(x => {
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
  list,
}) => (
  $(View, list.map(pokemon => $(PokeImage, { pokemon })))
))

const dexList = AllPokemon.map(x => x.name.replace(/_/g, ' '))

const Dex = ({
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
          onNewRequest: text => changePokemon(PokeMap[text.toUpperCase()]),
        })
      ])
    ),
    pokemon && (
      $(AppBar, {
        title: pokemon ? ucFirst(pokemon.name) : null,
        onLeftIconButtonTouchTap: () => changePokemon(null),
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
    pokemon === null && $(PokeList, { list }),

    // The Pokedex view
    pokemon !== null && $(PokemonPage, { pokemon }),
  ])
)

const findPokemon = name => (
  AllPokemon.filter(x => x.name === name.toUpperCase())[0]
)

const hashChanged = () => findPokemon(window.location.hash.split('/')[1] || '')

const maybeChangePokemonFromHash = () => {
  const poke = hashChanged()
  if (poke) changePokemon(poke)
}

module.exports = compose(
  withState('pokemon', 'changePokemonInternal', null),
  withState('list', 'sortPokemon', AllPokemon),
  lifecycle({
    componentDidMount() {
      bus.subscribe(pokemon => this.props.changePokemonInternal(pokemon))
      maybeChangePokemonFromHash(this.props)
      window.onhashchange = () => maybeChangePokemonFromHash(this.props)
    },
  })
)(Dex)
