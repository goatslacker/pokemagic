const SearchHistory = require('../components/SearchHistory')
const connect = require('../utils/connect')
const historyStore = require('../stores/HistoryStore')

const SearchHistoryContainer = connect(SearchHistory, {
  listenTo: () => ({ historyStore }),
  getProps: state => state.historyStore,
})

module.exports = SearchHistoryContainer
