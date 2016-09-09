function createActionCreators(arr) {
  return arr.reduce((obj, name) => {
    const type = name.toLowerCase().replace(/_(\w)/, (a, b) => b.toUpperCase())
    obj[type] = payload => ({ type, payload })
    obj[name] = name
    return obj
  }, {})
}

module.exports = createActionCreators([
  'CHANGED_NAME',
  'CHANGED_CP',
  'CHANGED_HP',
  'CHANGED_STARDUST',
  'CHANGED_LEVEL',
  'CHANGED_TRAINER_LEVEL',
  'RESULTS_CALCULATED',
  'RESULTS_RESET',
  'VALUES_RESET',
])
