const B = require('../utils/Lotus.react')
const DetailedAnalysis = require('./DetailedAnalysis')
const MoveCombos = require('./MoveCombos')
const RefineResults = require('./RefineResults')
const Styles = require('../styles')
const bestMovesFor = require('../../src/best-moves')
const finalEvolutions = require('../../json/finalEvolutions')
const n = require('../utils/n')
const pokemonActions = require('../actions/pokemonActions')

function Results(props) {
  var bestMoves = null
  if (finalEvolutions[props.pokemon.name]) {
    bestMoves = bestMovesFor(props.pokemon.name, props.best.Level, props.best.ivs.IndAtk)
  }

  console.log(props)

  return (
    n(B.View, [
      n(B.View, [
        n(B.Button, { size: 'sm', onClick: pokemonActions.resultsReset }, 'Check Another'),
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
          n('h3', { style: Styles.resultsRow }, `Best moveset combos for ${props.pokemon.name}`),
          n(MoveCombos, { moves: bestMoves }),
        ])
      ),

      props.best.meta.EvolveCP && (
        n(B.View, { spacingVertical: 'md', style: Styles.resultsRow }, [
          n('h3', 'Evolution'),
          n(B.Panel, [
            n(B.Text, `If evolved it would have a CP of about ${props.best.meta.EvolveCP}`),
          ]),
        ])
      ),

      props.best.meta.Stardust > 0 && (
        n(B.View, { spacingVertical: 'md', style: Styles.resultsRow }, [
          n('h3', { style: Styles.resultsRow }, `Maxing out to level ${props.best.meta.MaxLevel}`),
          props.pokemon.level === null && (
            n(B.Text, `Assuming that your Pokemon's current level is ${props.best.Level}. The information below is just an estimate.`)
          ),
          n(B.View, [
            n(B.Panel, `Current level: ${props.best.Level}`),
            n(B.Panel, `Candy cost: ${props.best.meta.Candy}`),
            n(B.Panel, `Stardust cost: ${props.best.meta.Stardust}`),
            n(B.Panel, `CP: ${props.best.meta.MaxCP}`),
            n(B.Panel, `HP: ${props.best.meta.MaxHP}`),
          ]),
        ])
      ),

      n(B.View, { spacingVertical: 'md' }, [
        n('h3', { style: Styles.resultsRow }, 'Yours vs Perfect by level'),
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
        n('h3', { style: Styles.resultsRow }, 'Ratings'),
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
