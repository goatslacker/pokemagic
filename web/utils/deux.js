const redux = require('redux')

// TODO put all errors and validation behind a dev flag

const createActionCreators = (arr) => {
  return arr.reduce((obj, type) => {
    if (typeof type !== 'string') {
      throw new TypeError('An unknown action type was passed in. Action types must be strings.')
    }

    const name = type.toLowerCase().replace(/_(\w)/g, (a, b) => b.toUpperCase())

    if (obj.creators[name]) throw new ReferenceError(`Action type "${name}" already exists.`)
    if (obj.types[type]) throw new ReferenceError(`Action type "${type}" already exists.`)

    obj.creators[name] = payload => ({ type, payload })
    obj.types[type] = type

    return obj
  }, {
    creators: {},
    types: {},
  })
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

const createReducer = (initialState, reducers) => mergeState(
  initialState,
  reducers
)

const createStore = reducers => redux.createStore(
  redux.combineReducers(
    Object.keys(reducers).reduce((o, key) => {
      const reducer = reducers[key]
      o[key] = createReducer(reducer.getInitialState(), reducer.reducers)
      return o
    }, {})
  )
)

const validate = (action, reducers) => {
  const unhandledActions = Object.keys(reducers).reduce((obj, key) => {
    const reducer = reducers[key]

    if (typeof reducer.getInitialState !== 'function') {
      throw new TypeError(`The reducer ${key} does not have getInitialState defined or it is not a function.`)
    }
    if (typeof reducer.reducers !== 'object') {
      throw new TypeError(`The reducer ${key} does not have reducers defined or it is not an Object.`)
    }

    const undefinedActions = Object.keys(reducer.reducers).filter((x) => {
      if (action.types.hasOwnProperty(x)) {
        delete obj[x]
        return false
      }
      return true
    })
    if (undefinedActions.length) {
      throw new ReferenceError(`The reducer '${key}' has undefined actions: ${undefinedActions.join(', ')}.`)
    }
    return obj
  }, Object.assign({}, action.types))

  const unhandledActionsKeys = Object.keys(unhandledActions)

  if (unhandledActionsKeys.length) {
    throw new ReferenceError(`The following actions are defined but not used: ${unhandledActionsKeys.join(', ')}.`)
  }
}

module.exports = (actionTypes, reducers) => {
  if (!reducers) throw new TypeError('"reducers" must be an Object.')
  if (!Array.isArray(actionTypes)) throw new TypeError('"actionTypes" must be an Array.')
  const action = createActionCreators(actionTypes)

  validate(action, reducers)

  const store = createStore(reducers)
  const dispatch = redux.bindActionCreators(action.creators, store.dispatch)
  return {
    actionCreators: action.creators,
    dispatch,
    redux,
    store,
  }
}
