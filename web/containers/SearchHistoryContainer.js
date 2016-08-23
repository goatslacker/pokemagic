const SearchHistory = require('../components/SearchHistory')
const connect = require('../utils/connect')
const historyStore = require('../stores/HistoryStore')

const SearchHistoryContainer = connect(SearchHistory, {
  listenTo: () => ({ historyStore }),
  getProps: state => ({
    searches: Object.keys(state.historyStore.searches)
      .map(k => state.historyStore.searches[k]),
  }),
})

module.exports = SearchHistoryContainer
