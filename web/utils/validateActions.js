function validateActions(actions, mergers) {
  const invalid = Object.keys(mergers).filter(x => !actions.hasOwnProperty(x))
  if (invalid.length) throw new ReferenceError(invalid.join(' '))
  return mergers
}

module.exports = validateActions
