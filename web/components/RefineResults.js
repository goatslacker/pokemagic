const Appraisal = require('./Appraisal')
const B = require('../utils/Lotus.react')
const ResultsTable = require('./ResultsTable')
const Styles = require('../styles')
const liftState = require('../utils/liftState')
const n = require('../utils/n')
const reactRedux = require('react-redux')
const redux = require('../redux')

const IV_RANGE = {
  great: [82, 100],
  good: [67, 81],
  bad: [51, 66],
  ugly: [0, 50],
}

const STAT_VALUES = {
  great: [15],
  good: [13, 14],
  bad: [8, 9, 10, 11, 12],
  ugly: [0, 1, 2, 3, 4, 5, 6, 7],
}

// TODO this code exists in two places now
function refine(results) {
  const appraisal = redux.store.getState().appraisal

  const attrs = Object.keys(appraisal.attrs)
  const ivRange = IV_RANGE[appraisal.ivRange]
  const stats = STAT_VALUES[appraisal.stat]

  return results.filter((result) => {
    var rangeCheck = true
    var attrCheck = true
    var statCheck = true

    if (ivRange != null) {
      rangeCheck = (
        result.percent.PerfectIV >= ivRange[0] &&
        result.percent.PerfectIV <= ivRange[1]
      )
    }

    const MAX_IV = Math.max(
      result.ivs.IndAtk,
      result.ivs.IndDef,
      result.ivs.IndSta
    )

    if (attrs.length) {
      attrCheck = attrs.every(attr => result.ivs[attr] === MAX_IV)
    }

    if (Array.isArray(stats)) {
      statCheck = stats.some(stat => stat === MAX_IV)
    }

    return rangeCheck && attrCheck && statCheck
  })
}

function RefineResults(props) {
  const results = refine(props.results)
  const chance = Math.floor(
    results.filter(x => x.percent.PerfectIV > 66).length / results.length
  ) || 0

  return n(B.View, { spacingVertical: 'md' }, [
    n(B.H3, { style: Styles.resultsRow }, `Possible values (${results.length})`),

    n(B.Text, { style: Styles.resultsRow }, [
      results.length === 1
        ? n(B.Text, 'Congrats, here are your Pokemon\'s values')
        : n(B.Text, [
          'There are ',
          n('strong', results.length),
          ' possibilities and a ',
          n('strong', `${chance}%`),
          ` chance you will have a good ${props.name}. `,
          'Highlighted rows show even levels since you can only catch even leveled Pokemon.',
        ]),
    ]),

    !props.show && results.length > 1 && (
      n(B.View, { style: Styles.resultsRow }, [
        n(B.View, { spacing: 'sm' }),
        n(B.Text, 'Refine results by selecting "Appraise" from the Pokemon screen.'),
        n(B.Button, {
          onClick: () => props.setState({ show: true }),
        }, 'Refine Results'),
        n(B.View, { spacing: 'sm' }),
      ])
    ),

    props.show && n(Appraisal),

    n(ResultsTable, { results }),
  ])
}

const RefineResultsStateful = liftState({
  show: false,
}, RefineResults)

module.exports = reactRedux.connect(
  state => ({ appraisal: state.appraisal })
)(RefineResultsStateful)
