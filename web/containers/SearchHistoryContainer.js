const SearchHistory = require('../components/SearchHistory')
const reactRedux = require('react-redux')

const SearchHistoryContainer = reactRedux.connect(state => ({
  searches: Object.keys(state.history.searches)
    .map(k => state.history.searches[k]),
}))(SearchHistory)

module.exports = SearchHistoryContainer
