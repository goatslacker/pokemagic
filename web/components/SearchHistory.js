const B = require('react-bootstrap')
const Styles = require('../styles')
const calculateValues = require('../utils/calculateValues')
const n = require('../utils/n')

function SearchHistory(props) {
  return (
    n(B.Row, [
      n('h3', { style: Styles.resultsRow }, 'Recent Searches'),
      n(B.ListGroup, props.searches.map((search) => (
        n(B.ListGroupItem, [
          n('a', {
            onClick: () => calculateValues(search.values),
          }, search.text),
        ])
      )))
    ])
  )
}

module.exports = SearchHistory
