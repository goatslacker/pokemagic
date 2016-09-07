const alt = require('../alt')

const appraisalActions = alt.generateActions('AppraisalActions', [
  'teamSelected',
  'ivRangeSet',
  'attrToggled',
])

module.exports = appraisalActions
