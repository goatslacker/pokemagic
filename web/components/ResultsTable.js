const B = require('../utils/Lotus.react')
const Styles = require('../styles')
const n = require('../utils/n')

function ResultsTable(props) {
  return n(B.View, [
    n(B.Table, { clean: true, border: true }, [
      n('thead', [
        n('tr', [
          n('th', 'IV'),
          n('th', 'Level'),
          n('th', 'CP %'),
          n('th', 'HP %'),
          n('th', 'Battle %'),
        ]),
      ]),
      n('tbody', props.results.map((value) => (
        n('tr', {
          onClick: () => {
            if (props.onSelect) props.onSelect(value)
          },
          style: {
            backgroundColor: Number(value.Level) % 1 === 0 ? '#ede0c6' : '',
          },
        }, [
          n('td', [
            n(B.Text, {
              className: 'label',
              style: value.percent.PerfectIV > 74
                ? Styles.good
                : value.percent.PerfectIV > 66
                ? Styles.ok
                : Styles.bad,
            }, `${value.percent.PerfectIV}%`),
            ' ',
            n('strong', value.strings.iv),
          ]),
          n('td', value.Level),
          n('td', value.percent.PercentCP),
          n('td', value.percent.PercentHP),
          n('td', value.percent.PercentBatt),
        ])
      ))),
    ]),
    props.results.length === 0 && (
      n(B.Text, 'No results found')
    ),
  ])
}

module.exports = ResultsTable
