const B = require('../utils/Lotus.react')
const Styles = require('../styles')
const calculateValues = require('../utils/calculateValues')
const n = require('../utils/n')

function SearchHistory(props) {
  return (
    n(B.View, [
      n('h3', { style: Styles.resultsRow }, 'Recent Searches'),
      n(B.View, props.searches.map((search) => (
        n(B.Panel, [
          n('a', {
            onClick: () => calculateValues(search.values),
          }, search.text),
        ])
      )))
    ])
  )
}

module.exports = SearchHistory
