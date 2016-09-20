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
const dispatchableActions = require('../dispatchableActions')
const getEffectiveness = require('../../src/getTypeEffectiveness').getEffectiveness
const n = require('../utils/n')
const store = require('../store')

const Types = {}
const Mon = Pokemon.reduce((obj, mon) => {
  const type1 = mon.type1
  const type2 = mon.type2

  Types[type1] = type1
  if (type2) Types[type2] = type2

  obj[mon.name] = mon
  return obj
}, {})
const ObjMoves = MovesList.reduce((obj, move) => {
  obj[move.Name] = move
  return obj
}, {})

const pokemonList = Pokemon.map(x => ({ label: x.name.replace(/_/g, ' '), value: x.name }))
const movesList = pokemonList.slice()
movesList.push.apply(
  movesList,
  MovesList.map(x => ({ label: x.Name.replace(/_/g, ' '), value: x.Name }))
)
const dexList = Object.keys(Types).map(x => ({ label: x, value: x })).concat(movesList)

const cpIsh = x => (
  x.stats.attack *
  Math.pow(x.stats.defense, 0.5) *
  Math.pow(x.stats.stamina, 0.5)
)

const percentInRange = (num, min, max) => ((num - min) * 100) / (max - min)

const MEWTWO_OV = 58771
const CATERPIE_OV = 4778

const ovRating = mon => percentInRange(cpIsh(mon), CATERPIE_OV, MEWTWO_OV)

const getType = mon => (
  [mon.type1, mon.type2]
    .filter(Boolean)
    .map(type => n(TypeBadge, { type }))
)

const sortByBestBaseStats = (a, b) => cpIsh(a) > cpIsh(b) ? -1 : 1

const cond = html => html || null

// TODO put this in an action?
function sweetMoves(x) {
  if (!x) {
    dispatchableActions.pokemonChanged([])
    dispatchableActions.movesChanged([])
    dispatchableActions.dexTextChanged('')
    return
  }

  if (Mon.hasOwnProperty(x.value)) {
    const best = bestMovesFor(x.value)
    const mon = Pokemon[Mon[x.value].id - 1]
    dispatchableActions.pokemonChanged([])
    dispatchableActions.movesChanged(best)
  } else if (ObjMoves.hasOwnProperty(x.value)) {
    dispatchableActions.movesChanged(ObjMoves[x.value])
    dispatchableActions.pokemonChanged(
      Pokemon.filter(mon => (
        mon.moves1.some(m => m.Name === x.value) ||
        mon.moves2.some(m => m.Name === x.value)
      )).sort(sortByBestBaseStats)
    )
  } else if (Types.hasOwnProperty(x.value)) {
    dispatchableActions.movesChanged(
      MovesList
        .filter(y => y.Type === x.value)
        .sort((a, b) => a.Power > b.Power ? -1 : 1)
    )
    dispatchableActions.pokemonChanged(
      Pokemon.filter(mon => (
        mon.type1 === x.value ||
        mon.type2 === x.value
      )).sort(sortByBestBaseStats)
    )
  }
  dispatchableActions.dexTextChanged(x.value)
}

// TODO take some of this stuff
// the type effectiveness stuff might be nice
function Pokedex(props) {
  const types = [props.pokemon.type1, props.pokemon.type2]
    .filter(Boolean).join('/')
  const fx = getEffectiveness(props.pokemon)
  const family = Pokemon
    .filter(x => x.family === props.pokemon.family)
    .filter(x => x.name !== props.pokemon.name)

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
    family.length && (
      n(B.View, {
        style: Styles.resultsRow,
      }, [
        n(B.View, { spacing: 'sm' }),
        n(B.Text, 'Family'),
        n(B.Panel, family.map(fam => n(B.Image, {
          onClick: () => sweetMoves({ value: fam.name }),
          src: `images/${fam.name}.png`,
          height: 50,
          width: 50,
        }))),
      ])
    ) || undefined,
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
  const level = store.getState().calculator.trainerLevel || 20
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
          n('th', 'Type'),
        ]),
      ]),
      n('tbody', props.pokemon.map(mon => (
        n('tr', [
          n('td', [n(B.Image, {
            onClick: () => sweetMoves({ value: mon.name }),
            src: `images/${mon.name}.png`,
            height: 60,
            width: 60,
          })]),
          n('td', Math.round(ovRating(mon))),
          n('td', getType(mon)),
        ])
      ))),
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
          onChange: sweetMoves,
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
