const Appraisal = require('./Appraisal')
const B = require('../utils/Lotus.react')
const ResultsTable = require('./ResultsTable')
const Styles = require('../styles')
const liftState = require('../utils/liftState')
const n = require('../utils/n')
const reactRedux = require('react-redux')
const store = require('../store')

const IV_RANGE = {
  great: [82, 100],
  good: [67, 81],
  bad: [51, 66],
  ugly: [0, 50],
}

function refine(results) {
  const appraisal = store.getState().appraisal

  const attrs = Object.keys(appraisal.attrs)
  const ivRange = IV_RANGE[appraisal.ivRange]

  return results.filter((result) => {
    var rangeCheck = true
    var statCheck = true

    if (ivRange != null) {
      rangeCheck = (
        result.percent.PerfectIV >= ivRange[0] &&
        result.percent.PerfectIV <= ivRange[1]
      )
    }

    if (attrs.length) {
      const maxiv = Math.max(
        result.ivs.IndAtk,
        result.ivs.IndDef,
        result.ivs.IndSta
      )

      statCheck = attrs.every(attr => result.ivs[attr] === maxiv)
    }

    return rangeCheck && statCheck
  })
}

function RefineResults(props) {
  const results = refine(props.results)
  const chance = Math.floor(
    results.filter(x => x.percent.PerfectIV > 66).length / results.length
  ) || 0

  return n(B.View, { spacingVertical: 'md' }, [
    n('h3', { style: Styles.resultsRow }, `Possible values (${results.length})`),

    n(B.Text, { style: Styles.resultsRow }, [
      results.length === 1
        ? n('span', 'Congrats, here are your Pokemon\'s values')
        : n('span', [
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
