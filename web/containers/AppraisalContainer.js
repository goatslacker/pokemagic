const connect = require('../utils/connect')
const appraisalStore = require('../stores/AppraisalStore')
const Appraisal = require('../components/Appraisal')

const AppraisalContainer = connect(Appraisal, {
  listenTo: () => ({ appraisalStore }),
  getProps: state => state.appraisalStore,
})

module.exports = AppraisalContainer
