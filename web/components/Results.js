const B = require('../utils/Lotus.react')
const DetailedAnalysis = require('./DetailedAnalysis')
const MoveCombos = require('./MoveCombos')
const RefineResults = require('./RefineResults')
const Styles = require('../styles')
const bestMovesFor = require('../../src/best-moves')
const finalEvolutions = require('../../json/finalEvolutions')
const n = require('../utils/n')
const redux = require('../redux')

function Results(props) {
  var bestMoves = null
  if (finalEvolutions[props.pokemon.name]) {
    bestMoves = bestMovesFor(props.pokemon.name, props.best.Level, props.best.ivs.IndAtk)
  }

  console.log(props)

  return (
    n(B.View, [
      n(B.View, [
        n(B.Button, { size: 'sm', onClick: redux.dispatch.resultsReset }, 'Check Another'),
      ]),

      n(B.View, { spacingVertical: 'md', style: Styles.resultsRow }, [
        n(B.Text, { style: Styles.bigText }, props.pokemon.name),
        n(B.Text, `CP: ${props.pokemon.cp} | HP: ${props.pokemon.hp}`),
        n(B.View, { style: Styles.pokemonImage }, [
          n(B.Image, { src: `images/${props.pokemon.name}.png`, height: 150, width: 150 }),
        ]),
        n(
          B.Text,
          { style: Styles.bigText },
          props.range.iv[0] === props.range.iv[1]
            ? `${props.range.iv[0]}%`
            : `${props.range.iv[0]}% - ${props.range.iv[1]}%`
        ),
        n(B.Text, { style: Styles.resultsRow }, [
          props.chance === 100
            ? `Keep your ${props.pokemon.cp}CP ${props.pokemon.name}`
            : props.chance === 0
              ? `Send this Pokemon to the grinder for candy.`
              : `Maybe you should keep this Pokemon around.`
        ]),
      ]),

      n(RefineResults, { name: props.pokemon.name, results: props.values }),

      // We should only show best moveset if it is in its final evolved form...
      bestMoves && (
        n(B.View, { spacingVertical: 'md' }, [
          n(B.H3, { style: Styles.resultsRow }, `Best moveset combos for ${props.pokemon.name}`),
          n(MoveCombos, { moves: bestMoves }),
        ])
      ),

      props.best.meta.EvolveCP && (
        n(B.View, { spacingVertical: 'md', style: Styles.resultsRow }, [
          n(B.H3, 'Evolution'),
          n(B.Panel, [
            n(B.Text, `If evolved it would have a CP of about ${props.best.meta.EvolveCP}`),
          ]),
        ])
      ),

      props.best.levels.length && (
        n(B.View, { spacingVertical: 'md', style: Styles.resultsRow }, [
          n(B.H3, { style: Styles.resultsRow }, 'Values per level'),
          n(B.Table, [
            n('thead', [
              n('tr', [
                n('th', 'Level'),
                n('th', 'CP'),
                n('th', 'HP'),
                n('th', 'Candy'),
                n('th', 'Stardust'),
              ]),
            ]),
            n('tbody', props.best.levels.map(info => n('tr', [
              n('td', info.level),
              n('td', info.cp),
              n('td', info.hp),
              n('td', info.candy),
              n('td', info.stardust),
            ]))),
          ]),
        ])
      ),

      n(B.View, { spacingVertical: 'md' }, [
        n(B.H3, { style: Styles.resultsRow }, 'Yours vs Perfect by level'),
        n(B.Table, [
          n('thead', [
            n('tr', [
              n('th', 'Level'),
              n('th', 'Your CP'),
              n('th', 'Best CP'),
              n('th', 'Your HP'),
              n('th', 'Best HP'),
            ]),
          ]),
          n('tbody', props.values.reduce((o, value) => {
            if (o._[value.Level]) return o
            o._[value.Level] = 1
            o.rows.push(value)
            return o
          }, { rows: [], _: {} }).rows
          .sort((a, b) => a.Level > b.Level ? 1 : -1)
          .map((value) => (
            n('tr', [
              n('td', value.Level),
              n('td', value.CP),
              n('td', value.meta.MaxLevelCP),
              n('td', value.HP),
              n('td', value.meta.MaxLevelHP),
            ])
          ))),
        ]),
      ]),

      n(B.View, { spacingVertical: 'md' }, [
        n(B.H3, { style: Styles.resultsRow }, 'Ratings'),
        n(B.Table, [
          n('thead', [
            n('tr', [
              n('th', 'Level'),
              n('th', 'Overall'),
              n('th', props.pokemon.name),
            ].concat(props.best.rating.type.map(type => (
              n('th', type.type)
            )))),
          ]),
          n('tbody', props.values.reduce((o, value) => {
            if (o._[value.Level]) return o
            o._[value.Level] = 1
            o.rows.push(value)
            return o
          }, { rows: [], _: {} }).rows
          .sort((a, b) => a.Level > b.Level ? 1 : -1)
          .map((value) => (
            n('tr', [
              n('td', value.Level),
              n('td', Math.round(value.rating.overall.value)),
              n('td', Math.round(value.rating.pokemon.value)),
            ].concat(value.rating.type.map(type => (
              n('td', Math.round(type.rating.value))
            ))))
          ))),
        ]),
      ]),

      n(DetailedAnalysis, { results: props.values }),
    ])
  )
}

module.exports = Results
