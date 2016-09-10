function createActionCreators(arr) {
  return arr.reduce((obj, type) => {
    const name = type.toLowerCase().replace(/_(\w)/g, (a, b) => b.toUpperCase())

    if (obj[name]) throw new ReferenceError(`${name} already exists`)
    if (obj[type]) throw new ReferenceError(`${type} already exists`)

    obj[name] = payload => ({ type, payload })
    obj[type] = type
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

  'TEAM_SELECTED',
  'APPRAISAL_IV_RANGE_SET',
  'APPRAISAL_ATTR_TOGGLED',

  'MOVES_CHANGED',
  'POKEMON_CHANGED',
  'DEX_TEXT_CHANGED',

  'POKEMON_CHECKED',
  'SEARCHES_LOADED',
])
