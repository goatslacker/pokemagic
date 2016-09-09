function mergeState(initialState, mergers) {
  return (state, action) => {
    if (state === undefined) return initialState
    if (mergers[action.type]) {
      return Object.assign(
        {},
        state,
        mergers[action.type](action.payload, state, action)
      )
    }
    return state
  }
}

module.exports = mergeState
