const B = require('../utils/Lotus.react')
const Styles = require('../styles')
const calculateValues = require('../utils/calculateValues')
const n = require('../utils/n')
const scrollTop = require('../utils/scrollTop')

function fromHistory(search) {
  calculateValues(search)
  scrollTop()
}

// TODO input for searching/sorting
// showing N or X in history
function SearchHistory(props) {
  return (
    n(B.View, [
      n('h3', { style: Styles.resultsRow }, 'Recent Searches'),
      n(B.View, props.searches.map((search) => (
        n(B.Panel, [
          n('a', {
            onClick: () => fromHistory(search),
          }, `${search.name} ${search.cp}CP ${search.hp}HP`),
        ])
      )))
    ])
  )
}

module.exports = SearchHistory
