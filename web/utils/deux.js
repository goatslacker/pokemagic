const redux = require('redux')

const createActionCreators = (arr) => {
  return arr.reduce((obj, type) => {
    const name = type.toLowerCase().replace(/_(\w)/g, (a, b) => b.toUpperCase())

    if (obj[name]) throw new ReferenceError(`${name} already exists`)
    if (obj[type]) throw new ReferenceError(`${type} already exists`)

    obj[name] = payload => ({ type, payload })
    obj[type] = type
    return obj
  }, {})
}

const mergeState = (initialState, handlers) => {
  return (state, action) => {
    if (state === undefined) return initialState
    if (handlers[action.type]) {
      return Object.assign(
        {},
        state,
        handlers[action.type](state, action)
      )
    }
    return state
  }
}

const validateActions = (key, actions, handlers) => {
  const invalid = Object.keys(handlers).filter(x => !actions.hasOwnProperty(x))
  if (invalid.length) {
    throw new ReferenceError(`The reducer '${key}' has undefined actions: ${invalid.join(', ')}.`)
  }
  return handlers
}

const createReducer = (key, bundle, actionCreators) => mergeState(
  bundle.getInitialState(),
  validateActions(key, actionCreators, bundle.reducers)
)

const createStore = (reducers, actionCreators) => redux.createStore(
  redux.combineReducers(
    Object.keys(reducers).reduce((o, key) => {
      o[key] = createReducer(key, reducers[key], actionCreators)
      return o
    }, {})
  )
)

module.exports = (actionTypes, reducers) => {
  const actionCreators = createActionCreators(actionTypes)
  const store = createStore(reducers, actionCreators)
  const dispatch = redux.bindActionCreators(actionCreators, store.dispatch)
  return { actionCreators, dispatch, redux, store }
}
