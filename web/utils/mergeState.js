function mergeState(fn) {
  return (state, action) => {
    if (typeof fn === 'string') {
      return Object.assign({}, state, { [fn]: action.payload })
    }
    const inclState = fn(state, action)

    // no-op if we return falsy or if we return state from reducer
    if (!inclState || inclState === state) return state
    return Object.assign({}, state, inclState)
  }
}

module.exports = mergeState
