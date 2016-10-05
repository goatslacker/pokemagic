const redux = require('redux')

const DEUX_ACTION_TYPE = `$$DEUX-${Math.random().toString(16).substr(2, 7)}`

function createAsyncMiddleware() {
  return ({ dispatch, getState }) => next => action => {
    if (action.type === DEUX_ACTION_TYPE) {
      const type = action.meta.type
      const dispatcher = payload => dispatch({ type, payload })

      // If it's a Promise then auto-dispatch on resolve/reject
      if (typeof action.payload.then === 'function') {
        return action.payload.then(
          dispatcher,
          err => dispatch({ type, payload: err, error: true })
        )
      }

      return action.payload(dispatcher, getState)
    }

    return next(action)
  }
}

// TODO put all errors and validation behind a dev flag

const camelCase = type => type.toLowerCase().replace(/_(\w)/g, (a, b) => b.toUpperCase())

const addAction = (action, type, f) => {
  if (typeof type !== 'string') {
    throw new TypeError('An unknown action type was passed in. Action types must be strings.')
  }

  const name = camelCase(type)

  if (action.creators[name]) throw new ReferenceError(`Action type "${name}" already exists.`)
  if (action.types[type]) throw new ReferenceError(`Action type "${type}" already exists.`)

  action.creators[name] = arg => ({
    type: DEUX_ACTION_TYPE,
    payload: f(arg),
    meta: { type },
  })
  action.types[type] = type

  return action
}

const createActionCreators = actions => Object.keys(actions)
  .reduce((acc, type) => addAction(acc, type, actions[type]), {
    creators: {},
    types: {},
  })

const mergeState = (initialState, handlers) => {
  return (state, action) => {
    if (state === undefined) return initialState
    if (handlers[action.type]) {
      const inclState = handlers[action.type](state, action)
      // no-op if we return falsy or if we return state from reducer
      if (!inclState || inclState === state) return state
      return Object.assign({}, state, inclState)
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
  ),
  redux.applyMiddleware(createAsyncMiddleware())
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

// TODO middleware as an optional array
module.exports = (actions, reducers) => {
  if (!reducers) throw new TypeError('"reducers" must be an Object.')
  if (!actions) throw new TypeError('"actions" must be an Object.')

  const action = createActionCreators(actions)

  validate(action, reducers)

  const store = createStore(reducers)
  const dispatch = redux.bindActionCreators(action.creators, store.dispatch)

  return {
    dispatch,
    redux,
    store,
    types: action.types,
    creators: action.creators,
  }
}
