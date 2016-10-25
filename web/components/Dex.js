const B = require('../utils/Lotus.react')
const Matchup = require('./Matchup')
const liftState = require('../utils/liftState')
const MoveCombos = require('./MoveCombos')
const MovesList = require('../../json/moves.json')
const Pokemon = require('../../json/pokemon.json')
const Select = require('react-select')
const Styles = require('../styles')
const TypeBadge = require('./TypeBadge')
const analyzeBattleEffectiveness = require('../../src/analyzeBattleEffectiveness')
const redux = require('../redux')
const n = require('../utils/n')
const ovRating = require('../utils/ovRating')
const pokeRatings = require('../utils/pokeRatings').getRating

const avgComboDPS = require('../../src/avgComboDPS')

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

const isStab = (pokemon, move) => (
  [pokemon.type1, pokemon.type2]
    .filter(Boolean)
    .filter(type => type === move.Type)
    .length > 0
)

const Badge = props => (
  n(B.View, {
    style: {
      backgroundColor: props.color,
      border: '1px solid #888',
      borderRadius: 4,
      color: '#fff',
      display: 'inline-block',
      fontSize: props.small ? '0.5em' : '0.75em',
      lineHeight: '1em',
      marginRight: '0.5em',
      padding: '0.25em',
      textShadow: '0 0 1px #000',
    },
  }, props.text)
)

const Overall = ({ rate }) => (
  n(B.View, [
    n(Badge, {
      color: 'chartreuse',
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
  n(B.View, {
    style: {
      textDecoration: move.retired ? 'line-through' : '',
      marginBottom: 10,
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: selected ? '#ff0000' : '#333',
    },
  }, [
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
  n(B.View, {
    style: {
      textDecoration: move.retired ? 'line-through' : '',
      marginBottom: 10,
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: selected ? '#ff0000' : '#333',
    },
  }, [
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
  n(B.Panel, [
    n(B.Text, 'Overall'),
    n(B.Text, [rate.rating, '%']),
    n(B.Text, 'Attacking'),
    n(B.Text, [
      rate.atk.offenseRating,
      '% ',
      rate.atk.dps.toFixed(2),
      'dps',
    ]),
    n(B.Text, [
    ]),
    n(B.Text, 'Defending'),
    n(B.Text, [
      rate.def.defenseRating,
      '% ',
      rate.def.gymDPS.toFixed(2),
      'dps',
    ]),
  ])
)

const PokeInfo = props => (
  n(B.View, [
    n(B.View, { style: Styles.resultsRow }, [
      n(B.Header, ucFirst(props.pokemon.name)),

      n(B.Image, {
        onClick: () => redux.dispatch.dexTextChanged(props.pokemon.name),
        src: `images/${props.pokemon.name}.png`,
        height: 150,
        width: 150,
      }),

//      n(Overall, { rate: ovRating(props.pokemon) }),

      n(B.View, [
        `ATK ${props.pokemon.stats.attack}`,
        `DEF ${props.pokemon.stats.defense}`,
        `STA ${props.pokemon.stats.stamina}`,
      ].map(text => n(Badge, { color: 'lightsteelblue', text }))),

      n(B.View, [getType(props.pokemon)]),
    ]),

    // Combo Move DPS
    props.quick && props.charge && (
      n(ComboDPS, {
//        selectedMoves: [props.quick, props.charge].filter(Boolean).join('/'),
        rate: pokeRatings(props.pokemon, props.quick, props.charge),
      })
    ),

    n(B.Text, { strong: true }, 'Quick Moves'),

    n(B.View, props.pokemon.moves1.map(move => n(QuickMoveInfo, {
      move,
      stab: isStab(props.pokemon, move),
      info: PokeMoves[props.pokemon.name][move.Name],
      setState: props.setState,
      selected: props.quick === move.Name,
    }))),

    n(B.Divider),

    n(B.Text, { strong: true }, 'Charge Moves'),

    n(B.View, props.pokemon.moves2.map(move => n(ChargeMoveInfo, {
      move,
      stab: isStab(props.pokemon, move),
      info: PokeMoves[props.pokemon.name][move.Name],
      setState: props.setState,
      selected: props.charge === move.Name,
    }))),

    n(B.Divider),
  ])
)

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
    n(B.Header, `${props.pokemon.name} Attacking`),

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
  const mon = props.pokemon.length === 1 ? props.pokemon[0] : null

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
    mon && (
      n(B.View, [
        n(B.Text, { strong: true }, 'Quick Moves'),
        n(B.Table, [
          n('thead', [
            n('tr', [
              n('th', 'Name'),
              n('th', 'Power'),
              n('th', 'ms'),
              n('th', 'Energy'),
            ]),
          ]),
          n('tbody', mon.moves1.map(move => n('tr', [
            n('td', move.Name),
            n('td', move.Power),
            n('td', move.DurationMs),
            n('td', move.Energy),
          ]))),
        ]),
        n(B.Divider),
        n(B.Text, { strong: true }, 'Charge Moves'),
        n(B.Table, [
          n('thead', [
            n('tr', [
              n('th', 'Name'),
              n('th', 'Power'),
              n('th', 'ms'),
              n('th', 'Energy'),
            ]),
          ]),
          n('tbody', mon.moves2.map(move => n('tr', [
            n('td', move.Name),
            n('td', move.Power),
            n('td', move.DurationMs),
            n('td', move.Energy),
          ]))),
        ]),
        n(B.Divider),
      ])
    )
  ])
}

function Dex(props) {
  return (
    n(B.View, [
      // The search bar at the top
      n(B.FormControl, [
        n(Select, {
          inputProps: {
            autoCapitalize: 'off',
            autoCorrect: 'off',
            spellCheck: 'off',
          },
          name: 'move-selector',
          value: props.text,
          options: dexList,
          onChange: ev => redux.dispatch.dexTextChanged(ev.value),
        }),
      ]),

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
        n(B.Divider),
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
